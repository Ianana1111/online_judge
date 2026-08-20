import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { prisma } from "@oj/db";
import { TAIWAN_UNIVERSITY_DOMAINS, verifySchoolEmailDomain } from "@oj/shared";
import type { ChangeHandleDto, ChangePasswordDto, CreateUserDto, UpdateProfileDto, UpdateSettingsDto } from "@oj/shared";
import { isProActive, isUnlimited } from "../billing/billing.service";
import { computeStreak } from "../leaderboard/leaderboard.service";
import { MailService } from "../common/mail.service";

const SCHOOL_VERIFY_SECRET = process.env.SCHOOL_VERIFY_SECRET ?? "dev_school_verify_secret_change_me";
const SCHOOL_VERIFY_TOKEN_TTL = "30m";
// Long enough that a user who fat-fingers "resend" a couple times isn't rate-limited into
// frustration, short enough that it isn't a meaningful spam vector against someone else's inbox.
const SCHOOL_VERIFY_RESEND_COOLDOWN_MS = 60_000;

interface SchoolVerifyTokenPayload {
  purpose: "school-verify";
  sub: string;
  school: string;
  email: string;
}

const HEATMAP_DAYS = 365;

// Held inventory is capped so a long-dormant account can't stockpile a year of freezes and coast
// through it indefinitely — this is meant to smooth over the occasional missed day, not replace
// actually practicing regularly.
const MAX_STREAK_FREEZES = 2;

/** Grants at most one streak-freeze per calendar month (UTC — same naive-date convention
 * computeStreak already uses throughout this file, not the Asia/Taipei one billing.service uses
 * for its own quota month), lazily the same way submitQuotaUsed/submitQuotaMonth reset lazily
 * above: whichever request happens to notice the month rolled over pays the (trivial) cost of
 * granting it, instead of a separate cron job that has to run reliably every month. */
function applyMonthlyFreezeGrant(user: {
  streakFreezeCount: number;
  streakFreezeGrantMonth: string | null;
}): { streakFreezeCount: number; streakFreezeGrantMonth: string } {
  const monthKey = new Date().toISOString().slice(0, 7);
  if (user.streakFreezeGrantMonth === monthKey) {
    return { streakFreezeCount: user.streakFreezeCount, streakFreezeGrantMonth: monthKey };
  }
  return { streakFreezeCount: Math.min(MAX_STREAK_FREEZES, user.streakFreezeCount + 1), streakFreezeGrantMonth: monthKey };
}

// Every 7-day check-in milestone tops up the freeze inventory a little faster than the monthly
// grant alone — a small nudge to open the site even on days there's no time to actually solve
// anything, on top of (not instead of) the habit the solve-streak already rewards.
const LOGIN_STREAK_FREEZE_MILESTONE = 7;

/** Records "visited today" — distinct from computeStreak's solve-based streak, this counts
 * consecutive calendar days the user showed up at all, tracked lazily the same way the monthly
 * freeze grant is: whichever request happens to be the first one today pays the (trivial) cost of
 * updating it, no cron involved. Takes the freeze count/month *after* applyMonthlyFreezeGrant has
 * already run so a 7-day milestone landing on the same day as a fresh monthly grant stacks
 * correctly instead of one clobbering the other. */
function applyDailyCheckIn(
  user: { loginStreak: number; lastLoginDate: string | null },
  freezeState: { streakFreezeCount: number; streakFreezeGrantMonth: string },
): { loginStreak: number; lastLoginDate: string; streakFreezeCount: number; streakFreezeGrantMonth: string; milestoneHit: boolean } {
  const todayKey = new Date().toISOString().slice(0, 10);
  if (user.lastLoginDate === todayKey) {
    return { loginStreak: user.loginStreak, lastLoginDate: todayKey, ...freezeState, milestoneHit: false };
  }
  const yesterdayKey = new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10);
  const loginStreak = user.lastLoginDate === yesterdayKey ? user.loginStreak + 1 : 1;
  const milestoneHit = loginStreak % LOGIN_STREAK_FREEZE_MILESTONE === 0;
  const streakFreezeCount = milestoneHit
    ? Math.min(MAX_STREAK_FREEZES, freezeState.streakFreezeCount + 1)
    : freezeState.streakFreezeCount;
  return { loginStreak, lastLoginDate: todayKey, streakFreezeCount, streakFreezeGrantMonth: freezeState.streakFreezeGrantMonth, milestoneHit };
}

@Injectable()
export class UsersService {
  constructor(private readonly mail: MailService) {}

  /** Admin-only: accounts are provisioned by an instructor, not self-registered. */
  async createByAdmin(dto: CreateUserDto) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ handle: dto.handle }, { email: dto.email }] },
    });
    if (existing) throw new ConflictException("Handle or email already in use");

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    const user = await prisma.user.create({
      data: { handle: dto.handle, email: dto.email, passwordHash, role: dto.role },
    });
    return { id: user.id, handle: user.handle, email: user.email, role: user.role, createdAt: user.createdAt };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ ok: true }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    if (!user.passwordHash) throw new UnauthorizedException("This account signs in with Google, not a password");
    const ok = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!ok) throw new UnauthorizedException("Current password is incorrect");

    const passwordHash = await argon2.hash(dto.newPassword, { type: argon2.argon2id });
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { ok: true };
  }

  async changeHandle(userId: string, dto: ChangeHandleDto) {
    const existing = await prisma.user.findUnique({ where: { handle: dto.handle } });
    if (existing && existing.id !== userId) throw new ConflictException("That handle is already taken");

    const user = await prisma.user.update({ where: { id: userId }, data: { handle: dto.handle } });
    return { id: user.id, handle: user.handle, email: user.email, role: user.role };
  }

  async listAll() {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        handle: true,
        email: true,
        role: true,
        isStudent: true,
        plan: true,
        planExpiresAt: true,
        createdAt: true,
      },
    });
    // isUnlimited (not just isProActive): a lapsed planExpiresAt or a raw plan="PRO" alone isn't
    // enough on its own, isStudent is auto-Pro without ever having a real payment, and — unlike
    // /billing/me, which only ever answers for the logged-in caller and never needs to describe an
    // admin's own status — this table is admin-facing and must show admins as unrestricted too,
    // the same as what actually gates their submissions, instead of "Free" just because they've
    // never had a real payment on file.
    return users.map(({ plan, planExpiresAt, ...rest }) => {
      const unlimited = isUnlimited({ plan, planExpiresAt, role: rest.role, isStudent: rest.isStudent });
      return { ...rest, plan: unlimited ? ("PRO" as const) : ("FREE" as const), planExpiresAt: unlimited ? planExpiresAt : null };
    });
  }

  async setIsStudent(id: string, isStudent: boolean) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("User not found");
    const user = await prisma.user.update({ where: { id }, data: { isStudent } });
    return { id: user.id, handle: user.handle, isStudent: user.isStudent };
  }

  /** Merge-patches User.settings (default language, daily goal, onboarding dismissal, ...) rather
   * than replacing it wholesale, so setting one key never clobbers another feature's key that
   * happened not to be included in this particular PATCH body. */
  async updateSettings(userId: string, patch: UpdateSettingsDto) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { settings: true } });
    if (!user) throw new NotFoundException("User not found");
    const current = (user.settings as Record<string, unknown>) ?? {};
    const merged = { ...current, ...patch };
    await prisma.user.update({ where: { id: userId }, data: { settings: merged } });
    return { settings: merged };
  }

  /** Daily-habit signal for the personalized homepage: today's distinct-problems-solved count
   * against a goal (from User.settings.dailyGoal, default 1 until Phase 4e's settings endpoint
   * lets a user change it), plus the same all-time streak definition used on the leaderboard
   * (computeStreak — any AC day counts, not just first-solve days) and whether it's "at risk" of
   * breaking today. A day spent on a streak-freeze (StreakFreezeDay) counts the same as a real AC
   * day for streak purposes, so this also lazily applies the monthly freeze grant. */
  async daily(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        settings: true,
        streakFreezeCount: true,
        streakFreezeGrantMonth: true,
        loginStreak: true,
        lastLoginDate: true,
      },
    });
    if (!user) throw new NotFoundException("User not found");
    const settings = (user.settings as { dailyGoal?: number } | null) ?? {};
    const goal = typeof settings.dailyGoal === "number" && settings.dailyGoal > 0 ? Math.floor(settings.dailyGoal) : 1;

    const monthlyGranted = applyMonthlyFreezeGrant(user);
    const checkIn = applyDailyCheckIn(user, monthlyGranted);
    if (
      checkIn.loginStreak !== user.loginStreak ||
      checkIn.lastLoginDate !== user.lastLoginDate ||
      checkIn.streakFreezeCount !== user.streakFreezeCount ||
      checkIn.streakFreezeGrantMonth !== user.streakFreezeGrantMonth
    ) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          loginStreak: checkIn.loginStreak,
          lastLoginDate: checkIn.lastLoginDate,
          streakFreezeCount: checkIn.streakFreezeCount,
          streakFreezeGrantMonth: checkIn.streakFreezeGrantMonth,
        },
      });
    }

    const { currentStreak, solvedToday, frozenToday } = await this.computeStreakState(userId);

    return {
      goal,
      solvedToday,
      currentStreak,
      atRisk: currentStreak > 0 && solvedToday === 0 && !frozenToday,
      streakFreezeCount: checkIn.streakFreezeCount,
      frozenToday,
      loginStreak: checkIn.loginStreak,
      loginMilestoneHit: checkIn.milestoneHit,
    };
  }

  /** Shared by daily() and useStreakFreeze() — real AC dates unioned with any StreakFreezeDay
   * entries, since a frozen day counts exactly like a solved one for streak continuity. */
  private async computeStreakState(userId: string) {
    const [acSubs, freezeDays] = await Promise.all([
      prisma.submission.findMany({ where: { userId, verdict: "AC" }, select: { createdAt: true, problemId: true } }),
      prisma.streakFreezeDay.findMany({ where: { userId }, select: { date: true } }),
    ]);

    const todayKey = new Date().toISOString().slice(0, 10);
    const acDates = new Set<string>();
    const solvedTodaySet = new Set<string>();
    for (const s of acSubs) {
      const dateKey = s.createdAt.toISOString().slice(0, 10);
      acDates.add(dateKey);
      if (dateKey === todayKey) solvedTodaySet.add(s.problemId);
    }
    for (const f of freezeDays) acDates.add(f.date);

    return {
      currentStreak: computeStreak(acDates),
      solvedToday: solvedTodaySet.size,
      frozenToday: freezeDays.some((f) => f.date === todayKey),
    };
  }

  /** Spends one streak-freeze to cover today, when the user hasn't solved anything yet but has a
   * real streak alive through yesterday worth protecting. Deliberately manual (a button the user
   * clicks) rather than an automatic end-of-day job — there's no cron/scheduler elsewhere in this
   * codebase (see the monthly quota reset this mirrors), and a visible "protected today" action is
   * more legible than streaks silently patching themselves overnight. */
  async useStreakFreeze(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakFreezeCount: true, streakFreezeGrantMonth: true },
    });
    if (!user) throw new NotFoundException("User not found");
    const granted = applyMonthlyFreezeGrant(user);

    const { currentStreak, solvedToday, frozenToday } = await this.computeStreakState(userId);
    if (solvedToday > 0) throw new BadRequestException("You've already solved something today — no freeze needed.");
    if (frozenToday) throw new BadRequestException("Today's already protected by a freeze.");
    if (currentStreak <= 0) throw new BadRequestException("There's no active streak to protect right now.");
    if (granted.streakFreezeCount <= 0) throw new BadRequestException("No streak freezes available.");

    const todayKey = new Date().toISOString().slice(0, 10);
    await prisma.$transaction([
      prisma.streakFreezeDay.upsert({ where: { userId_date: { userId, date: todayKey } }, create: { userId, date: todayKey }, update: {} }),
      prisma.user.update({
        where: { id: userId },
        data: { streakFreezeCount: granted.streakFreezeCount - 1, streakFreezeGrantMonth: granted.streakFreezeGrantMonth },
      }),
    ]);

    return this.daily(userId);
  }

  async profile(handle: string) {
    const user = await prisma.user.findUnique({ where: { handle } });
    if (!user) throw new NotFoundException("User not found");

    const solved = await prisma.submission.findMany({
      where: { userId: user.id, verdict: "AC" },
      select: { problemId: true },
      distinct: ["problemId"],
    });

    return {
      handle: user.handle,
      createdAt: user.createdAt,
      solvedCount: solved.length,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      // Only a *verified* school is shown publicly / counts for leaderboard grouping — an
      // unconfirmed claim doesn't get to advertise itself on someone else's view of this profile.
      school: user.schoolVerifiedAt ? user.school : null,
      // isProActive (not isUnlimited): this is a PUBLIC profile, so it shows the same "am I Pro"
      // answer a user gets about themselves from /billing/me (students count, same as everywhere
      // else) rather than the admin-users-table's operational "is this account ever capped" view —
      // an admin browsing their own profile doesn't need a vanity Pro badge.
      plan: isProActive(user) ? ("PRO" as const) : ("FREE" as const),
    };
  }

  /** Public-facing profile fields only (bio/avatar/school) — never handle/password/plan, those go
   * through their own dedicated endpoints. */
  async updateProfile(userId: string, patch: UpdateProfileDto) {
    const data: {
      bio?: string;
      avatarUrl?: string | null;
      school?: string | null;
      schoolEmail?: null;
      schoolVerifiedAt?: null;
      schoolVerificationSentAt?: null;
    } = {};
    if (patch.bio !== undefined) data.bio = patch.bio;
    if (patch.avatarUrl !== undefined) data.avatarUrl = patch.avatarUrl;
    if (patch.school !== undefined) {
      const current = await prisma.user.findUnique({
        where: { id: userId },
        select: { school: true, schoolVerifiedAt: true },
      });
      if (patch.school !== current?.school) {
        // A confirmed school is permanent. Letting it be edited afterwards would make the
        // leaderboard's school grouping meaningless — anyone could verify one school, then swap
        // the label to a different one and keep the credibility that came with verifying.
        if (current?.schoolVerifiedAt) {
          throw new BadRequestException("Your school is verified and can't be changed.");
        }
        // Not verified yet, so nothing is being vouched for — switching schools just starts the
        // verification story over from scratch.
        data.schoolEmail = null;
        data.schoolVerifiedAt = null;
        data.schoolVerificationSentAt = null;
      }
      data.school = patch.school;
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { bio: true, avatarUrl: true, school: true, schoolEmail: true, schoolVerifiedAt: true },
    });
    return user;
  }

  /** Sends a one-time verification link to `email`, only if it's actually on the domain that
   * `school` (the user's current, already-saved claim) is known to use — see
   * TAIWAN_UNIVERSITY_DOMAINS. The email itself carries the token; nothing pending is otherwise
   * stored server-side beyond the resend cooldown and the "which address is this for" record. */
  async requestSchoolVerification(userId: string, email: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { school: true, schoolVerifiedAt: true, schoolVerificationSentAt: true },
    });
    if (!user) throw new NotFoundException("User not found");
    if (!user.school) throw new BadRequestException("Pick a school first.");
    if (!(user.school in TAIWAN_UNIVERSITY_DOMAINS)) {
      throw new BadRequestException("This school doesn't support email verification yet.");
    }
    if (user.schoolVerifiedAt) throw new BadRequestException("Your school is already verified.");
    if (!verifySchoolEmailDomain(email, user.school)) {
      const domain = TAIWAN_UNIVERSITY_DOMAINS[user.school as keyof typeof TAIWAN_UNIVERSITY_DOMAINS];
      throw new BadRequestException(`That address doesn't look like a @${domain} address.`);
    }
    if (user.schoolVerificationSentAt && Date.now() - user.schoolVerificationSentAt.getTime() < SCHOOL_VERIFY_RESEND_COOLDOWN_MS) {
      throw new BadRequestException("Give it a moment before requesting another email.");
    }

    const token = jwt.sign({ purpose: "school-verify", sub: userId, school: user.school, email } satisfies SchoolVerifyTokenPayload, SCHOOL_VERIFY_SECRET, {
      expiresIn: SCHOOL_VERIFY_TOKEN_TTL,
    });
    const webOrigin = (process.env.WEB_ORIGIN ?? "http://localhost:3000").split(",")[0].trim();
    const apiOrigin = (process.env.API_ORIGIN ?? "http://localhost:4000").split(",")[0].trim();
    const verifyUrl = `${apiOrigin}/users/school/verify/confirm?token=${encodeURIComponent(token)}`;

    await this.mail.send({
      to: email,
      subject: `Verify your ${user.school} email — judge.tw`,
      html: `
        <p>Confirm that <strong>${email}</strong> belongs to you to attach <strong>${user.school}</strong> to your judge.tw leaderboard entry.</p>
        <p><a href="${verifyUrl}">Verify my school email</a></p>
        <p>This link expires in 30 minutes. If you didn't request this, you can ignore this email.</p>
        <p><a href="${webOrigin}">judge.tw</a></p>
      `,
    });

    await prisma.user.update({ where: { id: userId }, data: { schoolEmail: email, schoolVerificationSentAt: new Date() } });
    return { ok: true as const };
  }

  /** The link clicked from the verification email — deliberately identity-free (no auth cookie
   * required): the signed token itself carries who this is for, so it works from any device/
   * browser the email happens to be opened in, not just the one the request originated from. Both
   * the claimed school and email are re-checked against the user's *current* row (not just
   * trusted from the token) so a stale link from before a school change can't silently verify the
   * wrong thing. */
  async confirmSchoolVerification(token: string): Promise<{ ok: boolean }> {
    let payload: SchoolVerifyTokenPayload;
    try {
      payload = jwt.verify(token, SCHOOL_VERIFY_SECRET) as unknown as SchoolVerifyTokenPayload;
    } catch {
      return { ok: false };
    }
    if (payload.purpose !== "school-verify") return { ok: false };

    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { school: true, schoolEmail: true } });
    if (!user || user.school !== payload.school || user.schoolEmail !== payload.email) return { ok: false };

    await prisma.user.update({ where: { id: payload.sub }, data: { schoolVerifiedAt: new Date() } });
    return { ok: true };
  }

  async stats(handle: string) {
    const user = await prisma.user.findUnique({ where: { handle } });
    if (!user) throw new NotFoundException("User not found");

    const since = new Date(Date.now() - HEATMAP_DAYS * 24 * 3600 * 1000);
    const submissions = await prisma.submission.findMany({
      where: { userId: user.id, createdAt: { gte: since } },
      select: {
        createdAt: true,
        languageKey: true,
        verdict: true,
        problemId: true,
        problem: { select: { difficulty: true } },
      },
    });

    const heatmapMap = new Map<string, number>();
    const langMap = new Map<string, number>();
    const verdictMap = new Map<string, number>();
    const solvedDifficultyByProblem = new Map<string, number>();

    for (const s of submissions) {
      const date = s.createdAt.toISOString().slice(0, 10);
      heatmapMap.set(date, (heatmapMap.get(date) ?? 0) + 1);
      langMap.set(s.languageKey, (langMap.get(s.languageKey) ?? 0) + 1);
      verdictMap.set(s.verdict, (verdictMap.get(s.verdict) ?? 0) + 1);
      if (s.verdict === "AC" && !solvedDifficultyByProblem.has(s.problemId)) {
        solvedDifficultyByProblem.set(s.problemId, s.problem.difficulty);
      }
    }

    const difficultyMap = new Map<number, number>();
    for (const diff of solvedDifficultyByProblem.values()) {
      difficultyMap.set(diff, (difficultyMap.get(diff) ?? 0) + 1);
    }

    return {
      heatmap: Array.from(heatmapMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      languageBreakdown: Array.from(langMap.entries()).map(([languageKey, count]) => ({ languageKey, count })),
      verdictBreakdown: Array.from(verdictMap.entries()).map(([verdict, count]) => ({ verdict, count })),
      solvedByDifficulty: Array.from(difficultyMap.entries()).map(([difficulty, count]) => ({ difficulty, count })),
    };
  }
}
