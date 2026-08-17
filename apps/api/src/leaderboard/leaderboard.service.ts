import { Injectable } from "@nestjs/common";
import { prisma } from "@oj/db";
import { CacheService } from "../common/cache.util";

export type LeaderboardPeriod = "all" | "week" | "month";
export type LeaderboardScope = "all" | "students";

function periodStart(period: LeaderboardPeriod): Date | undefined {
  const now = new Date();
  if (period === "week") return new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  if (period === "month") return new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  return undefined;
}

/** Consecutive-day streak ending today or yesterday (a still-open streak), from a set of AC
 * dates (YYYY-MM-DD, in whatever the DB timezone is). Solving nothing today doesn't break an
 * already-earned streak until tomorrow passes with still nothing solved. */
export function computeStreak(dates: Set<string>): number {
  const toKey = (d: Date) => d.toISOString().slice(0, 10);
  const today = new Date();
  let cursor = new Date(today);
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
    return this.cache.getOrSet(`leaderboard:${period}:${scope}:${school ?? ""}`, 60, () =>
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
      ...(school ? { school } : {}),
    };

    const users = await prisma.user.findMany({
      where: userWhere,
      select: { id: true, handle: true, avatarUrl: true, school: true },
    });
    const userIds = users.map((u) => u.id);

    const [periodSubs, allTimeSubs, freezeDays, perfByUser, totalCountByUser] = await Promise.all([
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
      // A streak-freeze day counts the same as a real AC day here too — otherwise this board would
      // disagree with the personal dashboard's own streak the moment someone uses one.
      prisma.streakFreezeDay.findMany({ where: { userId: { in: userIds } }, select: { userId: true, date: true } }),
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
    for (const f of freezeDays) {
      const set = acDatesByUser.get(f.userId) ?? new Set<string>();
      set.add(f.date);
      acDatesByUser.set(f.userId, set);
    }
    const todayKey = new Date().toISOString().slice(0, 10);
    const frozenTodayUserIds = new Set(freezeDays.filter((f) => f.date === todayKey).map((f) => f.userId));

    const POINTS_PER_STAR = 10;
    const rows = users.map((u) => {
      const solved = solvedByUser.get(u.id) ?? new Map<string, number>();
      const score = [...solved.values()].reduce((sum, difficulty) => sum + difficulty * POINTS_PER_STAR, 0);
      const streak = computeStreak(acDatesByUser.get(u.id) ?? new Set());
      const perf = avgByUser.get(u.id);
      return {
        userId: u.id,
        handle: u.handle,
        avatarUrl: u.avatarUrl,
        school: u.school,
        score,
        solved: solved.size,
        streak,
        frozenToday: frozenTodayUserIds.has(u.id),
        avgTimeMs: perf?.avgTimeMs != null ? Math.round(perf.avgTimeMs) : null,
        avgMemoryKb: perf?.avgMemoryKb != null ? Math.round(perf.avgMemoryKb) : null,
        totalSubmissions: totalSubsByUser.get(u.id) ?? 0,
      };
    });

    rows.sort((a, b) => b.score - a.score || b.solved - a.solved || a.handle.localeCompare(b.handle));

    return rows
      .filter((r) => r.score > 0 || r.streak > 0)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }
}
