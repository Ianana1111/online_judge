import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { prisma, Prisma } from "@oj/db";
import { canonicalSchoolName } from "@oj/shared";
import { schoolEmailAllowed } from "./school-domains.service";
import type {
  ChangeHandleDto,
  ChangePasswordDto,
  CreateUserDto,
  DeleteAccountDto,
  UpdateProfileDto,
  UpdateSettingsDto,
} from "@oj/shared";
import { BillingService, isProActive, isUnlimited } from "../billing/billing.service";
import type { IssuedSession } from "../auth/auth.service";
import { AuthService } from "../auth/auth.service";
import { TokenService } from "../auth/token.service";
import { computeStreak } from "../leaderboard/leaderboard.service";
import { escapeMailHtml, MailService } from "../common/mail.service";

const SCHOOL_VERIFY_SECRET = process.env.SCHOOL_VERIFY_SECRET ?? "dev_school_verify_secret_change_me";
const SCHOOL_VERIFY_TOKEN_TTL = "30m";
const SCHOOL_TOKEN_ISSUER = "judge.tw";
const SCHOOL_TOKEN_AUDIENCE = "school-verification";
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
async function lockSchool(tx: Prisma.TransactionClient, userId: string) { await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('school_verify'), hashtext(${userId}))`; }
// Long enough that a user who fat-fingers "resend" a couple times isn't rate-limited into
// frustration, short enough that it isn't a meaningful spam vector against someone else's inbox.
const SCHOOL_VERIFY_RESEND_COOLDOWN_MS = 60_000;

interface SchoolVerifyTokenPayload {
  purpose: "school-verify";
  jti: string;
  sub: string;
  school: string;
  email: string;
}

/** Case/whitespace-insensitive key for UsedSchoolEmail — the one thing that has to line up between
 * an early check, the confirmed insert, and the migration's own backfill (see its comment), or the
 * same real inbox could slip through as "different" addresses. */
function normalizeSchoolEmail(email: string): string {
  return email.trim().toLowerCase();
}

const HEATMAP_DAYS = 365;

// How long a requested deletion sits reversible before AccountDeletionReaperService actually
// removes the row — long enough to recover from an accidental click or a session left open on a
// shared/campus computer, short enough that PDPA's erasure request is still honored promptly.
export const ACCOUNT_DELETION_GRACE_MS = 3 * 24 * 3600 * 1000;

/** Records visits on consecutive UTC dates, independently of the AC-based solve streak. */
export function applyDailyCheckIn(
  user: { loginStreak: number; lastLoginDate: string | null },
  now = new Date(),
): { loginStreak: number; lastLoginDate: string } {
  const todayKey = now.toISOString().slice(0, 10);
  if (user.lastLoginDate === todayKey) {
    return { loginStreak: user.loginStreak, lastLoginDate: todayKey };
  }
  const yesterdayKey = new Date(now.getTime() - 24 * 3600 * 1000).toISOString().slice(0, 10);
  const loginStreak = user.lastLoginDate === yesterdayKey ? user.loginStreak + 1 : 1;
  return { loginStreak, lastLoginDate: todayKey };
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly mail: MailService,
    private readonly auth: AuthService,
    private readonly billing: BillingService,
    private readonly tokens: TokenService,
  ) {}

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

  // Rotates the refresh session as a side effect (see AuthService.issueSession) so a refresh
  // token issued before the change — e.g. one an attacker obtained along with the old password —
  // can no longer be used to mint new access tokens, while the caller who just proved they know
  // the new password is transparently re-authenticated with a fresh one in the same response.
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<IssuedSession> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    if (!user.passwordHash) throw new UnauthorizedException("This account signs in with Google, not a password");
    const ok = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!ok) throw new UnauthorizedException("Current password is incorrect");

    const passwordHash = await argon2.hash(dto.newPassword, { type: argon2.argon2id });
    const updated = await prisma.user.updateMany({ where: { id: userId, passwordHash: user.passwordHash, authVersion: user.authVersion }, data: { passwordHash, authVersion: { increment: 1 } } });
    if (!updated.count) throw new UnauthorizedException("Credentials changed. Please log in again.");
    return this.auth.issueSession(user.id, user.handle, user.email, user.role, user.authVersion + 1);
  }

  /** Requests account deletion (PDPA right-to-erasure) — does NOT delete the row immediately.
   * Requires re-proving identity first, same reasoning as changePassword: a stolen or left-open
   * session shouldn't be enough on its own to destroy the account, only to use it.
   *   - Password accounts: re-enter the current password (dto.currentPassword).
   *   - Google-only accounts: no separate secret exists to check, so `deleteReauthToken` (minted by
   *     AuthController's googleCallback after the user re-authenticates with the *same* Google
   *     account, see intent=delete_account) stands in for it instead.
   * Cancels any active ECPay subscription up front — if that fails, the request aborts too, since a
   * pending-deletion account with a still-live recurring charge would keep billing a card with
   * nobody able to see or stop it. The row itself isn't removed until
   * AccountDeletionReaperService's sweep finds it past ACCOUNT_DELETION_GRACE_MS — see
   * cancelDeletion for how the user can back out before then. A best-effort notification email
   * goes out so a deletion the account owner didn't actually request (compromised or left-open
   * session) has a chance of being noticed and cancelled in time. */
  async deleteAccount(
    userId: string,
    dto: DeleteAccountDto,
    deleteReauthToken: string | undefined,
    refreshToken: string | undefined,
  ): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    if (user.passwordHash) {
      if (!dto.currentPassword) throw new UnauthorizedException("Current password is required");
      const ok = await argon2.verify(user.passwordHash, dto.currentPassword);
      if (!ok) throw new UnauthorizedException("Current password is incorrect");
    } else {
      if (!deleteReauthToken) throw new UnauthorizedException("Please re-authenticate with Google first");
      try {
        if (this.tokens.verifyDeleteReauthToken(deleteReauthToken).sub !== userId) {
          throw new Error("Token belongs to a different account");
        }
      } catch {
        throw new UnauthorizedException("Please re-authenticate with Google first");
      }
    }

    try {
      await this.billing.cancelSubscription(userId);
    } catch (e) {
      // No active subscription is the expected case for most accounts — nothing to cancel, not a
      // failure. Any other error (ECPay actually declining the cancel) must block deletion.
      if (!(e instanceof NotFoundException)) throw e;
    }

    await prisma.user.update({ where: { id: userId }, data: { deletionRequestedAt: new Date() } });
    // Sessions live in Redis, keyed by userId (see AuthService) — not in Postgres, so this doesn't
    // happen automatically just from the User row changing.
    await this.auth.logout(refreshToken);

    const webOrigin = (process.env.WEB_ORIGIN ?? "http://localhost:3000").split(",")[0].trim();
    const graceDays = Math.round(ACCOUNT_DELETION_GRACE_MS / (24 * 3600 * 1000));
    try {
      await this.mail.send({
        to: user.email,
        subject: "Your judge.tw account is scheduled for deletion",
        html: `
          <p>A deletion request was just made for the judge.tw account <strong>${user.handle}</strong>. It will be permanently deleted in <strong>${graceDays} days</strong>.</p>
          <p>If this wasn't you, log in at <a href="${webOrigin}/login">${webOrigin}</a> before then to cancel it — logging in shows a "cancel deletion" option instead of the normal site.</p>
          <p>If this was you, no action is needed.</p>
        `,
      });
    } catch (e) {
      // Best-effort — the deletion request itself is already recorded and still reversible during
      // the grace period even if this notification never reaches the inbox.
      this.logger.warn(`Failed to send deletion-scheduled email to ${user.email}: ${String(e)}`);
    }
  }

  /** Reverses a still-pending deletion requested via deleteAccount, as long as the grace period
   * hasn't already elapsed (past that, AccountDeletionReaperService may have already deleted the
   * row — there's nothing left to cancel). No extra re-proof of identity beyond the normal
   * @CurrentUser() session required here: unlike *starting* a deletion, undoing one is the safe
   * direction to make easy. */
  async cancelDeletion(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    if (!user.deletionRequestedAt) return;
    await prisma.user.update({ where: { id: userId }, data: { deletionRequestedAt: null } });
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

  /** Today's distinct AC problems and AC-based streak, plus a separate daily visit count. */
  async daily(userId: string) {
    const now = new Date();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        settings: true,
        loginStreak: true,
        lastLoginDate: true,
      },
    });
    if (!user) throw new NotFoundException("User not found");
    const settings = (user.settings as { dailyGoal?: number } | null) ?? {};
    const goal = typeof settings.dailyGoal === "number" && settings.dailyGoal > 0 ? Math.floor(settings.dailyGoal) : 1;

    const checkIn = applyDailyCheckIn(user, now);
    if (
      checkIn.loginStreak !== user.loginStreak ||
      checkIn.lastLoginDate !== user.lastLoginDate
    ) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          loginStreak: checkIn.loginStreak,
          lastLoginDate: checkIn.lastLoginDate,
        },
      });
    }

    const { currentStreak, solvedToday } = await this.computeStreakState(userId, now);

    return {
      goal,
      solvedToday,
      currentStreak,
      atRisk: currentStreak > 0 && solvedToday === 0,
      loginStreak: checkIn.loginStreak,
    };
  }

  private async computeStreakState(userId: string, now: Date) {
    const acSubs = await prisma.submission.findMany({ where: { userId, verdict: "AC" }, select: { createdAt: true, problemId: true } });

    const todayKey = now.toISOString().slice(0, 10);
    const acDates = new Set<string>();
    const solvedTodaySet = new Set<string>();
    for (const s of acSubs) {
      const dateKey = s.createdAt.toISOString().slice(0, 10);
      acDates.add(dateKey);
      if (dateKey === todayKey) solvedTodaySet.add(s.problemId);
    }
    return {
      currentStreak: computeStreak(acDates, now),
      solvedToday: solvedTodaySet.size,
    };
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
    return prisma.$transaction(async (tx) => {
      await lockSchool(tx, userId);
      const current = await tx.user.findUnique({ where: { id: userId }, select: { school: true, schoolVerifiedAt: true } });
      if (!current) throw new NotFoundException("User not found");
      const school = patch.school ? canonicalSchoolName(patch.school) : patch.school;
      const changed = school !== undefined && school !== current.school;
      if (changed && current.schoolVerifiedAt) throw new BadRequestException("Your school is verified and can't be changed.");
      return tx.user.update({ where: { id: userId }, data: {
        ...(patch.bio !== undefined ? { bio: patch.bio } : {}), ...(patch.avatarUrl !== undefined ? { avatarUrl: patch.avatarUrl } : {}),
        ...(school !== undefined ? { school } : {}),
        ...(changed ? { schoolEmail: null, schoolVerifiedAt: null, schoolVerificationSentAt: null, schoolVerificationTokenHash: null } : {}),
      }, select: { bio: true, avatarUrl: true, school: true, schoolEmail: true, schoolVerifiedAt: true } });
    });
  }

  /** Reserve the resend window and exact challenge before sending. The same user lock is also
   * used for school changes and confirmation, closing their check-then-update races. */
  async requestSchoolVerification(userId: string, rawEmail: string) {
    const email = normalizeSchoolEmail(rawEmail);
    const challenge = await prisma.$transaction(async (tx) => {
      await lockSchool(tx, userId);
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.deletionRequestedAt) throw new NotFoundException("User not found");
      if (!user.school) throw new BadRequestException("Pick a school first.");
      if (user.schoolVerifiedAt) throw new BadRequestException("Your school is already verified.");
      if (!await schoolEmailAllowed(email, user.school, tx)) throw new BadRequestException("Use a supported school email domain, or submit its official instructions for review.");
      if (user.schoolVerificationSentAt && Date.now() - +user.schoolVerificationSentAt < SCHOOL_VERIFY_RESEND_COOLDOWN_MS) throw new BadRequestException("Give it a moment before requesting another email.");
      const claimed = await tx.usedSchoolEmail.findUnique({ where: { email } });
      if (claimed && claimed.userId !== userId) throw new BadRequestException("That email has already been used to verify a different account.");
      const token = jwt.sign({ purpose: "school-verify", sub: userId, school: user.school, email, jti: randomUUID() } satisfies SchoolVerifyTokenPayload,
        SCHOOL_VERIFY_SECRET, { algorithm: "HS256", issuer: SCHOOL_TOKEN_ISSUER, audience: SCHOOL_TOKEN_AUDIENCE, expiresIn: SCHOOL_VERIFY_TOKEN_TTL });
      await tx.user.update({ where: { id: userId }, data: { schoolEmail: email, schoolVerificationSentAt: new Date(), schoolVerificationTokenHash: tokenHash(token) } });
      return { token, school: user.school, handle: user.handle };
    });
    const webOrigin = (process.env.WEB_ORIGIN ?? "http://localhost:3000").split(",")[0].trim();
    const verifyUrl = `${webOrigin}/verify-school#token=${encodeURIComponent(challenge.token)}`;
    try {
      await this.mail.send({ to: email, subject: `驗證 ${challenge.school} 學校信箱 / Verify school email — judge.tw`,
        html: `<p>你正在為 judge. 帳號 <strong>@${escapeMailHtml(challenge.handle)}</strong> 驗證 <strong>${escapeMailHtml(challenge.school)}</strong> 的學校信箱。</p>
          <p><a href="${escapeMailHtml(verifyUrl)}">確認驗證學校信箱 / Verify my school email</a></p>
          <p>開啟連結後請按確認按鈕，不需要先登入。即使信件在另一個 Chrome 個人檔案開啟，驗證仍會完成在上述 judge. 帳號。完成後回到原本使用 judge. 的瀏覽器即可；不需要改用學校 Google 帳號登入或重新註冊。</p>
          <p>此連結 30 分鐘內有效。如果不是你提出的申請，請忽略此信。</p>
          <p>Verify <strong>${escapeMailHtml(email)}</strong> for judge. account <strong>@${escapeMailHtml(challenge.handle)}</strong>. No sign-in is required on the confirmation page. After confirming, return to your original browser profile. Your school Google account is only used to access your mailbox; you do not need to sign in with it or create another judge. account.</p>
          <p>This link expires in 30 minutes. If you did not request it, ignore this email.</p><p><a href="${escapeMailHtml(webOrigin)}">judge.tw</a></p>` });
    } catch (error) {
      // A late failure must not clear a newer request or a completed verification.
      await prisma.user.updateMany({ where: { id: userId, schoolVerificationTokenHash: tokenHash(challenge.token), schoolVerifiedAt: null },
        data: { schoolVerificationSentAt: null, schoolVerificationTokenHash: null, schoolEmail: null } });
      throw error;
    }
    return { ok: true as const };
  }

  async confirmSchoolVerification(token: string): Promise<{ ok: boolean; reason?: "duplicate"; account?: { handle: string; school: string } }> {
    let payload: SchoolVerifyTokenPayload;
    try {
      if (token.length > 4096) return { ok: false };
      const decoded = jwt.verify(token, SCHOOL_VERIFY_SECRET, { algorithms: ["HS256"], issuer: SCHOOL_TOKEN_ISSUER, audience: SCHOOL_TOKEN_AUDIENCE });
      if (typeof decoded === "string" || decoded.purpose !== "school-verify" || typeof decoded.sub !== "string" || typeof decoded.school !== "string" || typeof decoded.email !== "string" || typeof decoded.jti !== "string") return { ok: false };
      payload = decoded as unknown as SchoolVerifyTokenPayload;
    } catch { return { ok: false }; }
    return prisma.$transaction(async (tx) => {
      await lockSchool(tx, payload.sub);
      const user = await tx.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.deletionRequestedAt || user.school !== payload.school || user.schoolEmail !== payload.email) return { ok: false };
      // Retrying the same already-completed claim is safe and never changes its timestamp.
      const account = { handle: user.handle, school: user.school };
      if (user.schoolVerifiedAt) return { ok: true, account };
      if (user.schoolVerificationTokenHash !== tokenHash(token) || !await schoolEmailAllowed(payload.email, payload.school, tx)) return { ok: false };
      const email = normalizeSchoolEmail(payload.email);
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('school_email'), hashtext(${email}))`;
      const claimed = await tx.usedSchoolEmail.findUnique({ where: { email } });
      if (claimed && claimed.userId !== payload.sub) return { ok: false, reason: "duplicate" as const };
      if (!claimed) await tx.usedSchoolEmail.create({ data: { email, userId: payload.sub, school: payload.school } });
      await tx.user.update({ where: { id: payload.sub }, data: { schoolVerifiedAt: new Date(), schoolVerificationTokenHash: null } });
      return { ok: true, account };
    });
  }

  // `year` selects a specific Jan 1 – Dec 31 calendar year (the profile page's heatmap year
  // picker) instead of the default rolling `HEATMAP_DAYS`-day window ("current") — same shape of
  // response either way, just a different date range, so every other consumer of this endpoint
  // (language/verdict breakdowns, difficulty badges) is unaffected unless it starts passing `year`.
  async stats(handle: string, year?: number) {
    const user = await prisma.user.findUnique({ where: { handle } });
    if (!user) throw new NotFoundException("User not found");

    const since = year ? new Date(Date.UTC(year, 0, 1)) : new Date(Date.now() - HEATMAP_DAYS * 24 * 3600 * 1000);
    const until = year ? new Date(Date.UTC(year + 1, 0, 1)) : undefined;
    const submissions = await prisma.submission.findMany({
      where: { userId: user.id, createdAt: { gte: since, ...(until ? { lt: until } : {}) } },
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
