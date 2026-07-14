import { Injectable } from "@nestjs/common";
import { prisma } from "@oj/db";
import { computeStreak } from "../leaderboard/leaderboard.service";
import { NotificationsService } from "../notifications/notifications.service";
import { ACHIEVEMENT_BY_CODE } from "./catalog";

@Injectable()
export class AchievementsService {
  constructor(private readonly notifications: NotificationsService) {}

  async listForUser(userId: string) {
    const rows = await prisma.userAchievement.findMany({ where: { userId }, orderBy: { earnedAt: "desc" } });
    return rows
      .map((r) => {
        const def = ACHIEVEMENT_BY_CODE.get(r.code);
        if (!def) return null;
        return { code: def.code, title: def.title, description: def.description, earnedAt: r.earnedAt };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }

  /** Awards a fixed one-off achievement directly (no evaluation needed) — used for events that
   * are true the first time they happen, like starting a virtual exam. Idempotent via the
   * (userId, code) unique constraint. */
  async awardDirect(userId: string, code: string): Promise<void> {
    const def = ACHIEVEMENT_BY_CODE.get(code);
    if (!def) return;
    const created = await prisma.userAchievement
      .create({ data: { userId, code } })
      .then(() => true)
      .catch(() => false); // unique violation = already earned, not an error
    if (created) {
      await this.notifications.create(userId, {
        type: "achievement",
        title: `Achievement unlocked: ${def.title}`,
        body: def.description,
      });
    }
  }

  /** Re-evaluates every AC-derived achievement after a new AC — cheap enough to run on every
   * accepted submission at this scale (a handful of queries over one user's own AC history). */
  async evaluateAfterAc(userId: string, problemId: string): Promise<void> {
    const already = new Set(
      (await prisma.userAchievement.findMany({ where: { userId }, select: { code: true } })).map((a) => a.code),
    );

    const acSubs = await prisma.submission.findMany({
      where: { userId, verdict: "AC" },
      select: { problemId: true, createdAt: true, problem: { select: { difficulty: true } } },
    });
    const solvedIds = new Set(acSubs.map((s) => s.problemId));
    const solvedCount = solvedIds.size;

    const toAward = new Set<string>();
    if (!already.has("first_ac") && solvedCount >= 1) toAward.add("first_ac");
    if (!already.has("solved_10") && solvedCount >= 10) toAward.add("solved_10");
    if (!already.has("solved_50") && solvedCount >= 50) toAward.add("solved_50");
    if (!already.has("solved_100") && solvedCount >= 100) toAward.add("solved_100");

    if (!already.has("first_4star") && acSubs.some((s) => s.problem.difficulty >= 4)) {
      toAward.add("first_4star");
    }

    if (!already.has("streak_7") || !already.has("streak_30")) {
      const dates = new Set(acSubs.map((s) => s.createdAt.toISOString().slice(0, 10)));
      const streak = computeStreak(dates);
      if (!already.has("streak_7") && streak >= 7) toAward.add("streak_7");
      if (!already.has("streak_30") && streak >= 30) toAward.add("streak_30");
    }

    if (!already.has("collection_cleared")) {
      const memberships = await prisma.collectionProblem.findMany({
        where: { problemId },
        select: { collectionId: true },
      });
      for (const m of memberships) {
        const allInCollection = await prisma.collectionProblem.findMany({
          where: { collectionId: m.collectionId },
          select: { problemId: true },
        });
        if (allInCollection.length > 0 && allInCollection.every((cp) => solvedIds.has(cp.problemId))) {
          toAward.add("collection_cleared");
          break;
        }
      }
    }

    for (const code of toAward) {
      const def = ACHIEVEMENT_BY_CODE.get(code);
      if (!def) continue;
      await prisma.userAchievement.upsert({
        where: { userId_code: { userId, code } },
        update: {},
        create: { userId, code },
      });
      await this.notifications.create(userId, {
        type: "achievement",
        title: `Achievement unlocked: ${def.title}`,
        body: def.description,
      });
    }
  }
}
