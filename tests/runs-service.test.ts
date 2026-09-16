import { beforeEach, expect, it, vi } from "vitest";
import { RunsService } from "../apps/api/src/runs/runs.service";
const fixture = vi.hoisted(() => ({ problem: vi.fn(), user: vi.fn() }));
vi.mock("../packages/db/src/index.ts", () => ({ prisma: { problem: { findFirst: fixture.problem }, user: { findUnique: fixture.user } } }));
vi.mock("../apps/api/src/billing/billing.service", () => ({ currentMonthKey: () => "2026-09", isUnlimited: () => true }));
const queue = { add: vi.fn() }, redis = { set: vi.fn(async () => "OK"), get: vi.fn(), publish: vi.fn() };
const dto = { problemId: "c000000000000000000000001", languageKey: "cpp17" as const, sourceCode: "source", cases: [{ id: "sample", sampleOrd: 1, input: "1\n" }] };
beforeEach(() => { fixture.problem.mockResolvedValue({ id: dto.problemId, samples: [{ ord: 1, input: "1\n" }] }); fixture.user.mockResolvedValue({ id: "owner" }); });
it("validates public sample membership before charging quota or enqueuing", async () => {
  const service = new RunsService(queue as any, redis as any);
  for (const c of [{ id: "bad", sampleOrd: 9 }, { id: "bad", sampleOrd: 1, input: "2\n" }]) await expect(service.create("owner", { ...dto, cases: [c] })).rejects.toThrow("Sample has changed");
  expect(redis.set).not.toHaveBeenCalled(); expect(queue.add).not.toHaveBeenCalled();
  await service.create("owner", dto);
  expect(fixture.problem.mock.calls.at(-1)?.[0].where).toEqual({ id: dto.problemId, visibility: true });
  expect(queue.add).toHaveBeenCalledWith("judge-test-runs", expect.objectContaining({ cases: dto.cases }));
});
it("does not expose hidden or missing problems through Run", async () => {
  fixture.problem.mockResolvedValue(null);
  await expect(new RunsService(queue as any, redis as any).create("owner", dto)).rejects.toThrow("Problem not found"); expect(queue.add).not.toHaveBeenCalled();
});
it("keeps results readable only by their owner", async () => {
  const service = new RunsService(queue as any, redis as any); redis.get.mockResolvedValue("owner");
  await expect(service.assertOwner("run", "other")).rejects.toThrow("Run not found or expired"); await expect(service.assertOwner("run", "owner")).resolves.toBeUndefined();
});
