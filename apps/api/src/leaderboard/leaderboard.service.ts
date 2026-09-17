import { Injectable } from "@nestjs/common";
import { prisma } from "@oj/db";
import { UNVERIFIED_SCHOOL_FILTER } from "@oj/shared";
import { CacheService } from "../common/cache.util";

export type LeaderboardPeriod = "all" | "week" | "month";
export type LeaderboardScope = "all" | "students";

function periodStart(period: LeaderboardPeriod): Date | undefined {
  const now = new Date();
  if (period === "week") return new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  if (period === "month") return new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  return undefined;
}

/** Consecutive UTC dates with an AC, ending today or yesterday. A missed day breaks the
 * streak when that day ends; today's still-open day does not break yesterday's streak. */
export function computeStreak(dates: Set<string>, now = new Date()): number {
  const toKey = (d: Date) => d.toISOString().slice(0, 10);
  const cursor = new Date(now);
  if (!dates.has(toKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1); // today not solved yet — check if yesterday keeps the streak alive
    if (!dates.has(toKey(cursor))) return 0;
  }
  let streak = 0;
  while (dates.has(toKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

@Injectable()
export class LeaderboardService {
  constructor(private readonly cache: CacheService) {}

  async get(period: LeaderboardPeriod, scope: LeaderboardScope = "all", school?: string) {
    // Recomputing this is a full AC-history scan (see below) — cache it briefly. A 60s-stale
    // leaderboard is an acceptable tradeoff for not re-scanning on every poll/page-load.
    return this.cache.getOrSet(`leaderboard:ac-only:${period}:${scope}:${school ?? ""}`, 60, () =>
      this.compute(period, scope, school),
    );
  }

  private async compute(period: LeaderboardPeriod, scope: LeaderboardScope, school?: string) {
    const since = periodStart(period);
    // scope=students narrows the ranked pool to a tutor's actual cohort (isStudent accounts) —
    // ranking against classmates is a far stronger motivator than an all-time-stranger global
    // board, and this site's real primary users are a tutor with named students.
    const userWhere = {
      role: "USER" as const,
      ...(scope === "students" ? { isStudent: true } : {}),
      // A school filter only ever matches *verified* claims — see requestSchoolVerification's
      // domain check for why an unverified one can't be trusted to group correctly.
      ...(school === UNVERIFIED_SCHOOL_FILTER
        ? { OR: [{ school: null }, { schoolVerifiedAt: null }] }
        : school
          ? { school, schoolVerifiedAt: { not: null } }
          : {}),
    };

    const users = await prisma.user.findMany({
      where: userWhere,
      select: { id: true, handle: true, avatarUrl: true, school: true, schoolVerifiedAt: true },
    });
    const userIds = users.map((u) => u.id);

    const [periodSubs, allTimeSubs, perfByUser, totalCountByUser] = await Promise.all([
      prisma.submission.findMany({
        where: { verdict: "AC", userId: { in: userIds }, ...(since ? { createdAt: { gte: since } } : {}) },
        select: { userId: true, problemId: true, createdAt: true, problem: { select: { difficulty: true } } },
        orderBy: { createdAt: "asc" },
      }),
      // Streaks always reflect real all-time practice habit, independent of the period filter.
      prisma.submission.findMany({
        where: { verdict: "AC", userId: { in: userIds } },
        select: { userId: true, createdAt: true },
      }),
      // Avg time/memory reflect solving *performance*, not attempt-window — always all-time and
      // AC-only, same reasoning as streaks: a "this week" average over 1-2 solves would be noise.
      prisma.submission.groupBy({
        by: ["userId"],
        where: { verdict: "AC", userId: { in: userIds } },
        _avg: { timeMs: true, memoryKb: true },
      }),
      // Total submissions (any verdict) — always all-time, a lifetime attempt-volume stat like
      // "solved count" rather than something that makes sense scoped to a rolling window.
      prisma.submission.groupBy({
        by: ["userId"],
        where: { userId: { in: userIds } },
        _count: { _all: true },
      }),
    ]);
    const avgByUser = new Map(perfByUser.map((p) => [p.userId, { avgTimeMs: p._avg.timeMs, avgMemoryKb: p._avg.memoryKb }]));
    const totalSubsByUser = new Map(totalCountByUser.map((c) => [c.userId, c._count._all]));

    const solvedByUser = new Map<string, Map<string, number>>(); // userId -> problemId -> difficulty (first AC only)
    for (const s of periodSubs) {
      const m = solvedByUser.get(s.userId) ?? new Map<string, number>();
      if (!m.has(s.problemId)) m.set(s.problemId, s.problem.difficulty);
      solvedByUser.set(s.userId, m);
    }

    const acDatesByUser = new Map<string, Set<string>>();
    for (const s of allTimeSubs) {
      const set = acDatesByUser.get(s.userId) ?? new Set<string>();
      set.add(s.createdAt.toISOString().slice(0, 10));
      acDatesByUser.set(s.userId, set);
    }
    const rows = users.map((u) => {
      const solved = solvedByUser.get(u.id) ?? new Map<string, number>();
      const streak = computeStreak(acDatesByUser.get(u.id) ?? new Set());
      const perf = avgByUser.get(u.id);
      return {
        // Deliberately no raw userId in this public, unauthenticated-readable response — it's
        // exactly the parameter GET /submissions?user=<id> takes, and that endpoint used to skip
        // authorization entirely (see submissions.service.list), so shipping a cuid here handed
        // out a ready-made key for pulling anyone's full solve history. `handle` already uniquely
        // identifies a row for the frontend's React key and its own /u/:handle links.
        handle: u.handle,
        avatarUrl: u.avatarUrl,
        // Only a verified claim is shown — same rule as the public profile (users.service.profile).
        school: u.schoolVerifiedAt ? u.school : null,
        solved: solved.size,
        streak,
        avgTimeMs: perf?.avgTimeMs != null ? Math.round(perf.avgTimeMs) : null,
        avgMemoryKb: perf?.avgMemoryKb != null ? Math.round(perf.avgMemoryKb) : null,
        totalSubmissions: totalSubsByUser.get(u.id) ?? 0,
      };
    });

    rows.sort((a, b) => b.solved - a.solved || b.streak - a.streak || a.handle.localeCompare(b.handle));

    return rows
      .filter((r) => r.solved > 0 || r.streak > 0)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }
}
