import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@oj/db";
import type { CreateContestDto } from "@oj/shared";
import type { RequestUser } from "../common/decorators";
import { BillingService } from "../billing/billing.service";
import { CacheService } from "../common/cache.util";

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

    // One query for every submission across every contest this user has ever entered, instead of
    // one query per contest — grouped by contestId in JS below.
    const submissions = await prisma.submission.findMany({
      where: { userId, contestId: { in: participants.map((p) => p.contestId) } },
      select: SCOREBOARD_SUBMISSION_SELECT,
      orderBy: { createdAt: "asc" },
    });
    const submissionsByContest = new Map<string, typeof submissions>();
    for (const s of submissions) {
      const list = submissionsByContest.get(s.contestId!) ?? [];
      list.push(s);
      submissionsByContest.set(s.contestId!, list);
    }

    const now = Date.now();
    return participants.map((p) => {
      const subs = submissionsByContest.get(p.contestId) ?? [];
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

    let myParticipant: { startedAt: Date; endsAt: Date; status: string } | null = null;
    if (requester) {
      const participant = await prisma.contestParticipant.findUnique({
        where: { contestId_userId: { contestId: id, userId: requester.id } },
      });
      if (participant) {
        myParticipant = {
          startedAt: participant.startedAt,
          endsAt: participant.endsAt,
          status: participant.status,
        };
      }
    }

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
      problems: contest.problems.map((cp) => ({
        label: cp.label,
        ord: cp.ord,
        problem: {
          id: cp.problem.id,
          slug: cp.problem.slug,
          title: cp.problem.title,
          statementMd: cp.problem.statementMd,
          inputSpecMd: cp.problem.inputSpecMd,
          outputSpecMd: cp.problem.outputSpecMd,
          timeLimitMs: cp.problem.timeLimitMs,
          memoryLimitKb: cp.problem.memoryLimitKb,
          difficulty: cp.problem.difficulty,
          source: cp.problem.source,
          tags: cp.problem.tags.map((t) => t.tag.slug),
          samples: cp.problem.samples.map((s) => ({ ord: s.ord, input: s.input, output: s.output })),
        },
      })),
    };
  }

  async register(id: string, userId: string) {
    const contest = await prisma.contest.findUnique({ where: { id } });
    if (!contest) throw new NotFoundException("Contest not found");

    const existing = await prisma.contestParticipant.findUnique({
      where: { contestId_userId: { contestId: id, userId } },
    });
    if (existing) return existing;

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
      const already = await tx.contestParticipant.findUnique({
        where: { contestId_userId: { contestId: id, userId } },
      });
      if (already) return already;

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
        // Virtual/individual: personal window starting the moment they register.
        startedAt = now;
        endsAt = new Date(now.getTime() + contest.durationMin * 60_000);
        status = "RUNNING";
      }

      return tx.contestParticipant.create({
        data: { contestId: id, userId, startedAt, endsAt, status },
      });
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
      include: { user: { select: { id: true, handle: true } } },
    });

    if (participants.length === 0) {
      return { standings: [], frozen: false };
    }

    // One query for every submission in the contest, instead of one query per participant.
    const allSubmissions = await prisma.submission.findMany({
      where: { contestId: id },
      select: SCOREBOARD_SUBMISSION_SELECT,
      orderBy: { createdAt: "asc" },
    });
    const submissionsByUser = new Map<string, typeof allSubmissions>();
    for (const s of allSubmissions) {
      const list = submissionsByUser.get(s.userId) ?? [];
      list.push(s);
      submissionsByUser.set(s.userId, list);
    }

    const now = Date.now();
    let anyFrozen = false;

    const rows = participants.map((p) => {
      const freezeCutoff = p.endsAt.getTime() - contest.freezeMin * 60_000;
      const stillRunning = now < p.endsAt.getTime();
      const isFrozenForThisParticipant = stillRunning && now >= freezeCutoff;
      if (isFrozenForThisParticipant) anyFrozen = true;

      const submissions = submissionsByUser.get(p.userId) ?? [];
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
        solvedCount,
        penalty,
        problems: problemCells,
      };
    });

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
