import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import argon2 from "argon2";
import { prisma } from "@oj/db";
import type { ChangeHandleDto, ChangePasswordDto, CreateUserDto } from "@oj/shared";
import { computeStreak } from "../leaderboard/leaderboard.service";

const HEATMAP_DAYS = 365;

@Injectable()
export class UsersService {
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
      select: { id: true, handle: true, email: true, role: true, isStudent: true, createdAt: true },
    });
    return users;
  }

  async setIsStudent(id: string, isStudent: boolean) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("User not found");
    const user = await prisma.user.update({ where: { id }, data: { isStudent } });
    return { id: user.id, handle: user.handle, isStudent: user.isStudent };
  }

  /** Daily-habit signal for the personalized homepage: today's distinct-problems-solved count
   * against a goal (from User.settings.dailyGoal, default 1 until Phase 4e's settings endpoint
   * lets a user change it), plus the same all-time streak definition used on the leaderboard
   * (computeStreak — any AC day counts, not just first-solve days) and whether it's "at risk" of
   * breaking today. */
  async daily(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { settings: true } });
    if (!user) throw new NotFoundException("User not found");
    const settings = (user.settings as { dailyGoal?: number } | null) ?? {};
    const goal = typeof settings.dailyGoal === "number" && settings.dailyGoal > 0 ? Math.floor(settings.dailyGoal) : 1;

    const acSubs = await prisma.submission.findMany({
      where: { userId, verdict: "AC" },
      select: { createdAt: true, problemId: true },
    });

    const todayKey = new Date().toISOString().slice(0, 10);
    const acDates = new Set<string>();
    const solvedTodaySet = new Set<string>();
    for (const s of acSubs) {
      const dateKey = s.createdAt.toISOString().slice(0, 10);
      acDates.add(dateKey);
      if (dateKey === todayKey) solvedTodaySet.add(s.problemId);
    }

    const currentStreak = computeStreak(acDates);
    const solvedToday = solvedTodaySet.size;

    return { goal, solvedToday, currentStreak, atRisk: currentStreak > 0 && solvedToday === 0 };
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
    };
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
