import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, Prisma } from "@oj/db";
import type { CreateContestDto } from "@oj/shared";
import type { RequestUser } from "../common/decorators";
import { AchievementsService } from "../achievements/achievements.service";
import { BillingService } from "../billing/billing.service";
import { CacheService } from "../common/cache.util";
import { cpeAppearancesFor, isRequesterPro } from "../billing/pro-gate.util";

// Fields actually needed for scoreboard/standings math — never sourceCode, which each of these
// queries used to pull (and immediately discard) for every submission in the contest.
const SCOREBOARD_SUBMISSION_SELECT = {
  contestId: true,
  userId: true,
  problemId: true,
  verdict: true,
  createdAt: true,
} as const;

@Injectable()
export class ContestsService {
  constructor(
    private readonly billing: BillingService,
    private readonly cache: CacheService,
    private readonly achievements: AchievementsService,
  ) {}

  async list() {
    const contests = await prisma.contest.findMany({ orderBy: { createdAt: "desc" } });
    return contests.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      kind: c.kind,
      startAt: c.startAt,
      durationMin: c.durationMin,
      isPublic: c.isPublic,
    }));
  }

  /** Contests this user has actually started — the contest catalog itself lives at /cpe (browse
   * & start) so this list only ever grows when someone registers, instead of dumping every
   * archived sitting on the page whether or not anyone's touched it. */
  async myContests(userId: string) {
    const participants = await prisma.contestParticipant.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      include: { contest: { include: { problems: true } } },
    });
    if (participants.length === 0) return [];

    // One query for every submission across every attempt this user has ever made, instead of one
    // query per attempt — grouped by contestParticipantId below so a re-attempt's submissions
    // never bleed into another attempt's solvedCount/penalty for the same contest.
    const submissions = await prisma.submission.findMany({
      where: { userId, contestParticipantId: { in: participants.map((p) => p.id) } },
      select: { ...SCOREBOARD_SUBMISSION_SELECT, contestParticipantId: true },
      orderBy: { createdAt: "asc" },
    });
    const submissionsByParticipant = new Map<string, typeof submissions>();
    for (const s of submissions) {
      const list = submissionsByParticipant.get(s.contestParticipantId!) ?? [];
      list.push(s);
      submissionsByParticipant.set(s.contestParticipantId!, list);
    }

    const now = Date.now();
    return participants.map((p) => {
      const subs = submissionsByParticipant.get(p.id) ?? [];
      const bySubs = subs.filter((s) => s.verdict !== "PENDING" && s.verdict !== "JUDGING");

      let solvedCount = 0;
      let penalty = 0;
      for (const cp of p.contest.problems) {
        const forProblem = bySubs.filter((s) => s.problemId === cp.problemId);
        const firstAc = forProblem.find((s) => s.verdict === "AC");
        if (firstAc) {
          const wrongBefore = forProblem.filter((s) => s.verdict !== "AC" && s.createdAt < firstAc.createdAt).length;
          const solveMin = Math.max(0, Math.round((firstAc.createdAt.getTime() - p.startedAt.getTime()) / 60_000));
          solvedCount += 1;
          penalty += solveMin + p.contest.penaltyMin * wrongBefore;
        }
      }

      return {
        id: p.contest.id,
        title: p.contest.title,
        slug: p.contest.slug,
        kind: p.contest.kind,
        durationMin: p.contest.durationMin,
        totalProblems: p.contest.problems.length,
        startedAt: p.startedAt,
        endsAt: p.endsAt,
        status: now < p.endsAt.getTime() ? "RUNNING" : "FINISHED",
        solvedCount,
        penalty,
        attemptNumber: p.attemptNumber,
      };
    });
  }

  async detail(id: string, requester: RequestUser | null) {
    const contest = await prisma.contest.findUnique({
      where: { id },
      include: {
        problems: {
          orderBy: { ord: "asc" },
          include: { problem: { include: { tags: { include: { tag: true } }, samples: { orderBy: { ord: "asc" } } } } },
        },
      },
    });
    if (!contest) throw new NotFoundException("Contest not found");

    // The most recent attempt, if any — a contest can now have more than one ContestParticipant
    // row per user (see ContestParticipant.attemptNumber), so this is "the one currently relevant
    // to this caller" rather than "the" participant. canStartNewAttempt tells the frontend whether
    // clicking start again would resume this attempt or begin a fresh one: only individual/virtual
    // contests (no fixed startAt) allow more than one, and only once the latest has actually ended.
    let myParticipant: { startedAt: Date; endsAt: Date; status: string; attemptNumber: number } | null = null;
    let canStartNewAttempt = false;
    // Which of this contest's problems this specific attempt has solved — scoped by
    // contestParticipantId (not just userId), same reasoning as the scoreboard: a re-attempt must
    // never inherit a "solved" mark from a different attempt's submissions.
    let solvedProblemIds: string[] = [];
    if (requester) {
      const participant = await this.latestParticipant(id, requester.id);
      if (participant) {
        myParticipant = {
          startedAt: participant.startedAt,
          endsAt: participant.endsAt,
          status: participant.status,
          attemptNumber: participant.attemptNumber,
        };
        canStartNewAttempt = !contest.startAt && Date.now() >= participant.endsAt.getTime();
        const solved = await prisma.submission.findMany({
          where: { contestParticipantId: participant.id, verdict: "AC" },
          select: { problemId: true },
          distinct: ["problemId"],
        });
        solvedProblemIds = solved.map((s) => s.problemId);
      } else {
        canStartNewAttempt = true;
      }
    }

    // The full problem content (statement, samples, judging metadata) is only ever meant to be
    // seen once *this* contest window is actually open for *this* caller — either they've
    // registered (which starts their own personal countdown, the only thing "starting" means for
    // a virtual/individual contest, the vast majority of contests here) or, for a rare scheduled
    // group session, the whole session has finished for everyone. Without this check the raw
    // API response carried every problem's full text regardless of any of that — the frontend's
    // own `disabled={!contest.myParticipant}` on each problem button was the only thing standing
    // between an anonymous visitor and the exam questions, and that's enforced nowhere but the
    // client. An admin (setting the contest up, or reviewing it) always sees the real content.
    const isAdmin = requester?.role === "ADMIN";
    const scheduledEndsAt = contest.startAt ? new Date(contest.startAt.getTime() + contest.durationMin * 60_000) : null;
    const scheduledSessionOver = !!scheduledEndsAt && Date.now() >= scheduledEndsAt.getTime();
    const canSeeContent = isAdmin || !!myParticipant || scheduledSessionOver;

    // Same uvaId/sourceUrl/cpeAppearances fields the standalone /problems/:slug endpoint returns —
    // ProblemView renders identically whether it got its problem from there or from here, so a
    // problem opened inside a running exam must carry the same fields or it silently loses its
    // "judgeable" status (uvaId is what SubmissionPanel checks to allow submitting at all).
    const isPro = requester ? await isRequesterPro(requester) : false;
    const problemIds = contest.problems.map((cp) => cp.problem.id);
    const appearancesById = canSeeContent && isPro ? await cpeAppearancesFor(problemIds) : new Map<string, number>();

    return {
      id: contest.id,
      title: contest.title,
      slug: contest.slug,
      kind: contest.kind,
      startAt: contest.startAt,
      durationMin: contest.durationMin,
      freezeMin: contest.freezeMin,
      penaltyMin: contest.penaltyMin,
      isPublic: contest.isPublic,
      myParticipant,
      canStartNewAttempt,
      solvedProblemIds,
      problems: contest.problems.map((cp) => ({
        label: cp.label,
        ord: cp.ord,
        problem: {
          id: cp.problem.id,
          slug: cp.problem.slug,
          title: cp.problem.title,
          statementMd: canSeeContent ? cp.problem.statementMd : "",
          sourceUrl: canSeeContent ? cp.problem.sourceUrl : null,
          inputSpecMd: canSeeContent ? cp.problem.inputSpecMd : "",
          outputSpecMd: canSeeContent ? cp.problem.outputSpecMd : "",
          timeLimitMs: cp.problem.timeLimitMs,
          memoryLimitKb: cp.problem.memoryLimitKb,
          difficulty: cp.problem.difficulty,
          source: cp.problem.source,
          uvaId: canSeeContent ? cp.problem.uvaId : null,
          cpeAppearances: canSeeContent && isPro ? (appearancesById.get(cp.problem.id) ?? 0) : null,
          tags: cp.problem.tags.map((t) => t.tag.slug),
          samples: canSeeContent ? cp.problem.samples.map((s) => ({ ord: s.ord, input: s.input, output: s.output })) : [],
        },
      })),
    };
  }

  /** Latest attempt (highest attemptNumber) this user has at this contest, or null if they've
   * never registered. Every downstream "am I currently in this contest" check should go through
   * this rather than a raw findUnique on {contestId, userId} — that compound key stopped being
   * unique once re-attempts existed (see ContestParticipant.attemptNumber). */
  private async latestParticipant(contestId: string, userId: string, tx: Prisma.TransactionClient | typeof prisma = prisma) {
    return tx.contestParticipant.findFirst({
      where: { contestId, userId },
      orderBy: { attemptNumber: "desc" },
    });
  }

  async register(id: string, userId: string) {
    const contest = await prisma.contest.findUnique({ where: { id } });
    if (!contest) throw new NotFoundException("Contest not found");

    const existing = await this.latestParticipant(id, userId);
    // Still running (or a scheduled sitting that hasn't started yet) — nothing new to create,
    // "starting" again just re-enters the same attempt. Re-attempts are also only offered for
    // individual/virtual contests (no fixed startAt) — a scheduled group sitting is a one-shot
    // synchronized event by design, so this returns the existing attempt unconditionally for it.
    if (existing && (contest.startAt || Date.now() < existing.endsAt.getTime())) return existing;

    // The FREE-plan virtual-contest cap is enforced by counting existing ContestParticipant rows
    // (assertCanStartVirtual), then this method creates a new one — a classic TOCTOU race: firing
    // several register() calls for *different* contests in parallel lets each one read the same
    // "count is still under the cap" snapshot before any of them commits its insert. A Postgres
    // advisory lock scoped to this user serializes concurrent register() calls by the same user
    // (it does not block other users), so the count-then-create is effectively atomic per user.
    return prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;

      // Re-check inside the lock: a concurrent duplicate registration for this same contest may
      // have committed while we were waiting to acquire it.
      const already = await this.latestParticipant(id, userId, tx);
      if (already && (contest.startAt || Date.now() < already.endsAt.getTime())) return already;

      await this.billing.assertCanStartVirtual(userId, tx);

      const now = new Date();
      let startedAt: Date;
      let endsAt: Date;
      let status: "REGISTERED" | "RUNNING";

      if (contest.startAt) {
        // Scheduled/group session: everyone shares the same clock, regardless of when each
        // participant clicks "register" — that's what makes it a synchronized CPE sitting rather
        // than a per-user virtual window.
        startedAt = contest.startAt;
        endsAt = new Date(contest.startAt.getTime() + contest.durationMin * 60_000);
        if (now >= endsAt) {
          throw new BadRequestException("This contest has already ended.");
        }
        status = now < contest.startAt ? "REGISTERED" : "RUNNING";
      } else {
        // Virtual/individual: personal window starting the moment they register (or re-register
        // for another attempt).
        startedAt = now;
        endsAt = new Date(now.getTime() + contest.durationMin * 60_000);
        status = "RUNNING";
      }

      return tx.contestParticipant.create({
        data: { contestId: id, userId, startedAt, endsAt, status, attemptNumber: (already?.attemptNumber ?? 0) + 1 },
      });
    }).then(async (participant) => {
      // Outside the transaction: awarding an achievement doesn't need to be atomic with the
      // registration itself, and awardDirect's own unique-constraint upsert already makes it
      // safe to call even when `already` short-circuited above (re-registering isn't a new event).
      await this.achievements.awardDirect(userId, "first_virtual_exam");
      return participant;
    });
  }

  async createByAdmin(dto: CreateContestDto) {
    return prisma.contest.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        kind: dto.kind,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        durationMin: dto.durationMin,
        freezeMin: dto.freezeMin,
        penaltyMin: dto.penaltyMin,
        scoring: dto.scoring,
        isPublic: dto.isPublic,
        problems: {
          create: dto.problems.map((p, ord) => ({ problemId: p.problemId, label: p.label, ord })),
        },
      },
      include: { problems: true },
    });
  }

  async scoreboard(id: string) {
    // Frozen-standings status depends on wall-clock time (freezeCutoff vs "now"), so a short TTL
    // keeps it close to real-time while still absorbing the bulk of a 12s-interval poll from every
    // connected viewer — this endpoint used to run a full per-participant query set on every call.
    return this.cache.getOrSet(`scoreboard:${id}`, 10, () => this.computeScoreboard(id));
  }

  private async computeScoreboard(id: string) {
    const contest = await prisma.contest.findUnique({
      where: { id },
      include: { problems: { orderBy: { ord: "asc" } } },
    });
    if (!contest) throw new NotFoundException("Contest not found");

    const participants = await prisma.contestParticipant.findMany({
      where: { contestId: id },
      // Ties in the best-attempt reduction below keep whichever attempt is seen first — ordering
      // by attemptNumber ascending makes that a stable, deterministic "earliest attempt wins a
      // tie" rather than depending on whatever order Postgres happens to return rows in.
      orderBy: { attemptNumber: "asc" },
      include: { user: { select: { id: true, handle: true } } },
    });

    if (participants.length === 0) {
      return { standings: [], frozen: false };
    }

    // One query for every submission in the contest, instead of one query per participant. Scoped
    // by contestParticipantId (not userId) — a user can now have more than one attempt at this
    // contest, and each attempt's submissions must only ever count toward that attempt's own row.
    const allSubmissions = await prisma.submission.findMany({
      where: { contestParticipantId: { in: participants.map((p) => p.id) } },
      select: { ...SCOREBOARD_SUBMISSION_SELECT, contestParticipantId: true },
      orderBy: { createdAt: "asc" },
    });
    const submissionsByParticipant = new Map<string, typeof allSubmissions>();
    for (const s of allSubmissions) {
      const list = submissionsByParticipant.get(s.contestParticipantId!) ?? [];
      list.push(s);
      submissionsByParticipant.set(s.contestParticipantId!, list);
    }

    const now = Date.now();
    let anyFrozen = false;

    // One row per attempt first — reduced to one row per user (their best attempt) below. Re-runs
    // are for practice; the standings only reward whichever attempt actually did best, so nobody
    // can pad the board by attempting the same sitting over and over.
    const attemptRows = participants.map((p) => {
      const freezeCutoff = p.endsAt.getTime() - contest.freezeMin * 60_000;
      const stillRunning = now < p.endsAt.getTime();
      const isFrozenForThisParticipant = stillRunning && now >= freezeCutoff;
      if (isFrozenForThisParticipant) anyFrozen = true;

      const submissions = submissionsByParticipant.get(p.id) ?? [];
      const visibleSubmissions = isFrozenForThisParticipant
        ? submissions.filter((s) => s.createdAt.getTime() <= freezeCutoff)
        : submissions;

      const problemCells: Record<string, { solved: boolean; attempts: number; solveMin: number | null }> = {};
      let solvedCount = 0;
      let penalty = 0;

      for (const cp of contest.problems) {
        const subsForProblem = visibleSubmissions.filter(
          (s) => s.problemId === cp.problemId && isTerminal(s.verdict),
        );
        const firstAc = subsForProblem.find((s) => s.verdict === "AC");

        if (firstAc) {
          const wrongBefore = subsForProblem.filter(
            (s) => s.verdict !== "AC" && s.createdAt.getTime() < firstAc.createdAt.getTime(),
          ).length;
          const solveMin = Math.max(0, Math.round((firstAc.createdAt.getTime() - p.startedAt.getTime()) / 60_000));
          problemCells[cp.label] = { solved: true, attempts: wrongBefore + 1, solveMin };
          solvedCount += 1;
          penalty += solveMin + contest.penaltyMin * wrongBefore;
        } else {
          const wrongAttempts = subsForProblem.filter((s) => s.verdict !== "AC").length;
          problemCells[cp.label] = { solved: false, attempts: wrongAttempts, solveMin: null };
        }
      }

      return {
        userId: p.user.id,
        handle: p.user.handle,
        attemptNumber: p.attemptNumber,
        solvedCount,
        penalty,
        problems: problemCells,
      };
    });

    // Best attempt per user: higher solvedCount wins, ties broken by lower penalty — the exact
    // criteria the standings are ultimately sorted by, so "best" here means the same thing as
    // "best" on the board.
    const bestByUser = new Map<string, (typeof attemptRows)[number]>();
    for (const row of attemptRows) {
      const current = bestByUser.get(row.userId);
      if (!current || row.solvedCount > current.solvedCount || (row.solvedCount === current.solvedCount && row.penalty < current.penalty)) {
        bestByUser.set(row.userId, row);
      }
    }
    const rows = [...bestByUser.values()];

    rows.sort((a, b) => (b.solvedCount - a.solvedCount) || (a.penalty - b.penalty));

    let rank = 0;
    let lastKey: string | null = null;
    const standings = rows.map((row, idx) => {
      const key = `${row.solvedCount}:${row.penalty}`;
      if (key !== lastKey) {
        rank = idx + 1;
        lastKey = key;
      }
      return { ...row, rank };
    });

    return { standings, frozen: anyFrozen };
  }
}

function isTerminal(verdict: string): boolean {
  return verdict !== "PENDING" && verdict !== "JUDGING";
}
