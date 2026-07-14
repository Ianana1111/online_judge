import { Injectable } from "@nestjs/common";
import { prisma } from "@oj/db";
import { CacheService } from "../common/cache.util";

export type LeaderboardPeriod = "all" | "week" | "month";

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

  async get(period: LeaderboardPeriod) {
    // Recomputing this is a full AC-history scan (see below) — cache it briefly. A 60s-stale
    // leaderboard is an acceptable tradeoff for not re-scanning on every poll/page-load.
    return this.cache.getOrSet(`leaderboard:${period}`, 60, () => this.compute(period));
  }

  private async compute(period: LeaderboardPeriod) {
    const since = periodStart(period);

    const [periodSubs, allTimeSubs, users] = await Promise.all([
      prisma.submission.findMany({
        where: { verdict: "AC", ...(since ? { createdAt: { gte: since } } : {}) },
        select: { userId: true, problemId: true, createdAt: true, problem: { select: { difficulty: true } } },
        orderBy: { createdAt: "asc" },
      }),
      // Streaks always reflect real all-time practice habit, independent of the period filter.
      prisma.submission.findMany({
        where: { verdict: "AC" },
        select: { userId: true, createdAt: true },
      }),
      prisma.user.findMany({ where: { role: "USER" }, select: { id: true, handle: true } }),
    ]);

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

    const POINTS_PER_STAR = 10;
    const rows = users.map((u) => {
      const solved = solvedByUser.get(u.id) ?? new Map<string, number>();
      const score = [...solved.values()].reduce((sum, difficulty) => sum + difficulty * POINTS_PER_STAR, 0);
      const streak = computeStreak(acDatesByUser.get(u.id) ?? new Set());
      return { userId: u.id, handle: u.handle, score, solved: solved.size, streak };
    });

    rows.sort((a, b) => b.score - a.score || b.solved - a.solved || a.handle.localeCompare(b.handle));

    return rows
      .filter((r) => r.score > 0 || r.streak > 0)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }
}
