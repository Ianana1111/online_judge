import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../packages/db/src/index";
import { applyDailyCheckIn, UsersService } from "../apps/api/src/users/users.service";
import { computeStreak, LeaderboardService } from "../apps/api/src/leaderboard/leaderboard.service";

const now = new Date("2026-09-17T12:00:00Z");
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(now); });
afterEach(() => vi.useRealTimers());

describe("daily visits without rewards", () => {
  it.each([
    [0, null, 1],
    [6, "2026-09-16", 7],
    [7, "2026-09-17", 7],
    [20, "2026-09-15", 1],
  ])("records %i visits ending %s as %i days", (loginStreak, lastLoginDate, expected) => {
    expect(applyDailyCheckIn({ loginStreak, lastLoginDate })).toEqual({ loginStreak: expected, lastLoginDate: "2026-09-17" });
  });
  it("continues across UTC month and year boundaries", () => {
    expect(applyDailyCheckIn({ loginStreak: 6, lastLoginDate: "2026-12-31" }, new Date("2027-01-01T00:00:00Z"))).toEqual({ loginStreak: 7, lastLoginDate: "2027-01-01" });
  });
});

describe("AC-only streaks", () => {
  it.each([
    [[], 0],
    [["2026-09-17"], 1],
    [["2026-09-16", "2026-09-15"], 2],
    [["2026-09-17", "2026-09-16", "2026-09-14"], 2],
    [["2026-09-15", "2026-09-14"], 0],
  ])("counts %j as %i days", (dates, expected) => {
    expect(computeStreak(new Set(dates))).toBe(expected);
  });
  it("ends a missed-day streak at the next UTC midnight", () => {
    const dates = new Set(["2026-12-31", "2026-12-30"]);
    expect(computeStreak(dates, new Date("2027-01-01T23:59:59Z"))).toBe(2);
    expect(computeStreak(dates, new Date("2027-01-02T00:00:00Z"))).toBe(0);
  });
});

describe("retired inventory and protection history", () => {
  const users = new UsersService({} as never, {} as never, {} as never, {} as never);
  function fixture(dates: string[]) {
    const account = { id: "u", handle: "learner", avatarUrl: null, school: null, schoolVerifiedAt: null,
      settings: { dailyGoal: 2 }, loginStreak: 6, lastLoginDate: "2026-09-16", streakFreezeCount: 1, streakFreezeGrantMonth: "2026-08" };
    vi.spyOn(prisma.user, "findUnique").mockImplementation(async () => account as never);
    vi.spyOn(prisma.user, "findMany").mockResolvedValue([account] as never);
    const update = vi.spyOn(prisma.user, "update").mockImplementation(async ({ data }) => Object.assign(account, data) as never);
    vi.spyOn(prisma.submission, "findMany").mockResolvedValue(dates.map((date) => ({ userId: "u", problemId: "p", createdAt: new Date(`${date}T10:00:00Z`), problem: { difficulty: 1 } })) as never);
    vi.spyOn(prisma.submission, "groupBy").mockResolvedValue([] as never);
    const history = vi.spyOn(prisma.streakFreezeDay, "findMany").mockResolvedValue([
      { userId: "u", date: "2026-09-14" }, { userId: "u", date: "2026-09-17" },
    ] as never);
    return { account, update, history };
  }
  it("ignores historical protected days consistently on the dashboard and leaderboard", async () => {
    const { history } = fixture(["2026-09-16", "2026-09-15", "2026-09-13"]);
    const daily = await users.daily("u");
    expect(daily).toEqual({ goal: 2, solvedToday: 0, currentStreak: 2, atRisk: true, loginStreak: 7 });
    const leaderboard = new LeaderboardService({ getOrSet: (_key: string, _ttl: number, compute: () => unknown) => compute() } as never);
    const rows = await leaderboard.get("all");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ handle: "learner", solved: 1, streak: daily.currentStreak });
    expect(rows[0]).not.toHaveProperty("frozenToday");
    expect(history).not.toHaveBeenCalled();
  });
  it("does not grant inventory at a monthly rollover or seven-day milestone, even on repeated visits", async () => {
    const { account, update } = fixture([]);
    await users.daily("u");
    await users.daily("u");
    expect(update).toHaveBeenCalledTimes(1);
    expect(account).toMatchObject({ loginStreak: 7, lastLoginDate: "2026-09-17", streakFreezeCount: 1, streakFreezeGrantMonth: "2026-08" });
  });
  it("resets visits after a gap and does not create a solve streak from login or old protection", async () => {
    const { account } = fixture([]);
    account.lastLoginDate = "2026-09-15";
    expect(await users.daily("u")).toEqual({ goal: 2, solvedToday: 0, currentStreak: 0, atRisk: false, loginStreak: 1 });
  });
  it("counts repeated AC submissions for today's same problem only once", async () => {
    fixture(["2026-09-17", "2026-09-17", "2026-09-16"]);
    expect(await users.daily("u")).toEqual({ goal: 2, solvedToday: 1, currentStreak: 2, atRisk: false, loginStreak: 7 });
  });
});
