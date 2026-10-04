import { beforeEach, expect, it, vi } from "vitest";
import { ProblemsService } from "../apps/api/src/problems/problems.service";

const db = vi.hoisted(() => ({ problem: { findUnique: vi.fn() }, submission: { findMany: vi.fn() } }));
vi.mock("../packages/db/src/index.ts", () => ({ prisma: db }));
const requester = { id: "mine", handle: "solver", role: "USER" };
const ac = (userId: string, timeMs: number, memoryKb: number | null = null, languageKey = "cpp17") => ({ userId, timeMs, memoryKb, languageKey });
const service = new ProblemsService();
beforeEach(() => { vi.clearAllMocks(); db.problem.findUnique.mockResolvedValue({ id: "problem" }); db.submission.findMany.mockResolvedValue([]); });

it("returns empty, finite distributions before the first AC", async () => {
  const stats = await service.stats("example", requester, 0, 0);
  expect(stats).toMatchObject({ solvedCount: 0, time: null, memory: null, memoryAvailable: false, yourBest: null, timeHistogram: [], memoryHistogram: null, yourTimeBucketIndex: null, yourRun: { beatsTimePct: null, timeBucketIndex: null, beatsMemoryPct: null } });
});
it("counts each solver once, ranks exact ties honestly and uses the true even median", async () => {
  db.submission.findMany.mockResolvedValue([ac("mine", 90, 1024), ac("mine", 20, 4096, "c11"), ac("fast", 10, 2048), ac("tie", 20, null), ac("slow", 50, 8192)]);
  const stats = await service.stats("example", requester, 90, 1024);
  expect(stats.solvedCount).toBe(4);
  expect(stats.time).toEqual({ minMs: 10, medianMs: 20, maxMs: 50 });
  expect(stats.yourBest).toEqual({ timeMs: 20, languageKey: "c11", memoryKb: 4096, timeRank: 2, timeTies: 2, beatsPct: 25, memoryRank: 2, beatsMemoryPct: 33.3 });
  expect(stats.memory).toEqual({ minKb: 2048, medianKb: 4096, maxKb: 8192, solverCount: 3 });
  expect(stats.yourRun).toMatchObject({ beatsTimePct: 0, beatsMemoryPct: 100 });
  expect(stats.timeHistogram.reduce((sum, b) => sum + b.count, 0)).toBe(4);
  expect(stats.timeHistogram[stats.yourTimeBucketIndex!].languageCounts.c11).toBe(1);
  expect(JSON.stringify(stats)).not.toMatch(/"userId"|"sourceCode"/);
});
it("averages the two central values for an even cohort and leaves missing personal memory unranked", async () => {
  db.submission.findMany.mockResolvedValue([ac("mine", 0), ac("other", 30, 0)]);
  const stats = await service.stats("example", requester);
  expect(stats.time?.medianMs).toBe(15);
  expect(stats.yourBest).toMatchObject({ timeRank: 1, memoryRank: null, beatsMemoryPct: null });
  expect(stats.yourMemoryBucketIndex).toBeNull();
  expect(stats.memory?.medianKb).toBe(0);
});
it("handles a lone solver and all-equal timings without claiming everyone was beaten", async () => {
  db.submission.findMany.mockResolvedValue([ac("mine", 0, 0)]);
  const one = await service.stats("example", requester);
  expect(one.yourBest).toMatchObject({ beatsPct: 0, timeRank: 1, timeTies: 1 });
  expect(one.timeHistogram).toEqual([{ minMs: 0, maxMs: 0, count: 1, languageCounts: { cpp17: 1 } }]);
  db.submission.findMany.mockResolvedValue([ac("mine", 10), ac("other", 10)]);
  expect((await service.stats("example", requester)).yourBest).toMatchObject({ beatsPct: 0, timeRank: 1, timeTies: 2 });
});
it("filters the cohort before choosing best submissions and rejects unsupported languages", async () => {
  db.submission.findMany.mockResolvedValue([ac("someone", 20, 512, "python3")]);
  const stats = await service.stats("example", requester, undefined, undefined, "python3");
  expect(db.submission.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { problemId: "problem", verdict: "AC", timeMs: { not: null }, languageKey: "python3" }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }));
  expect(stats.yourBest).toBeNull(); expect(stats.yourTimeBucketIndex).toBeNull();
  await expect(service.stats("example", requester, undefined, undefined, "nonsense")).rejects.toThrow("Unsupported comparison language");
});
it("keeps the earliest equal-fastest submission for consistent language and memory, with anonymous stats private fields empty", async () => {
  db.submission.findMany.mockResolvedValue([ac("mine", 10, 2048, "cpp17"), ac("mine", 10, 1024, "c11")]);
  expect((await service.stats("example", requester)).yourBest).toMatchObject({ memoryKb: 2048, languageKey: "cpp17" });
  const anonymous = await service.stats("example", null);
  expect(anonymous.yourBest).toBeNull(); expect(anonymous.yourTimeBucketIndex).toBeNull(); expect(anonymous.yourMemoryBucketIndex).toBeNull();
});
it("does not return a dataset for unknown problems", async () => {
  db.problem.findUnique.mockResolvedValue(null);
  await expect(service.stats("missing", null)).rejects.toThrow("Problem not found");
});
