import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "../packages/db/src/index";
import { BillingService, currentMonthKey } from "../apps/api/src/billing/billing.service";
import { ContestsService } from "../apps/api/src/contests/contests.service";
import { SubmissionsService } from "../apps/api/src/submissions/submissions.service";
import { SubmissionDispatcherService } from "../apps/api/src/submissions/submission-dispatcher.service";
import { createRedisConnection } from "../apps/api/src/common/redis.providers";

describe.skipIf(process.env.RUN_DB_TESTS !== "1")("exam and submission transactions", () => {
  const users: string[] = [], contests: string[] = [], problems: string[] = [];
  let redis: ReturnType<typeof createRedisConnection>;
  const billing = new BillingService();
  const achievements = { awardDirect: vi.fn().mockResolvedValue(undefined), evaluateAfterAc: vi.fn().mockResolvedValue(undefined) };
  const exams = new ContestsService(billing, { getOrSet: (_key: string, _ttl: number, read: () => unknown) => read() } as never, achievements as never);
  beforeAll(() => {
    const db = new URL(process.env.DATABASE_URL ?? "invalid:");
    if (db.hostname !== "127.0.0.1" || db.port !== "55432" || db.pathname !== "/oj_test" || process.env.REDIS_URL !== "redis://127.0.0.1:56379") throw new Error("Disposable local database and Redis are required");
    redis = createRedisConnection();
  });
  afterAll(async () => {
    await prisma.contest.deleteMany({ where: { id: { in: contests } } });
    await prisma.user.deleteMany({ where: { id: { in: users } } });
    await prisma.problem.deleteMany({ where: { id: { in: problems } } });
    if (users.length) await redis.del(...users.map((id) => `submit_cooldown:${id}`));
    await redis.quit(); await prisma.$disconnect();
  });
  async function fixture() {
    const suffix = randomUUID();
    const user = await prisma.user.create({ data: { handle: `exam_${suffix}`, email: `${suffix}@example.test`, isStudent: true } }); users.push(user.id);
    const problem = await prisma.problem.create({ data: { title: "Test sum", slug: `test-${suffix}`, statementMd: "Add two integers", testCases: { create: { ord: 0, input: "1 2", output: "3" } } } }); problems.push(problem.id);
    const makeContest = async (startAt?: Date) => {
      const contest = await prisma.contest.create({ data: { title: "Test exam", slug: randomUUID(), durationMin: 60, freezeMin: 0, startAt,
        problems: { create: { problemId: problem.id, ord: 0, label: "A" } } } }); contests.push(contest.id); return contest;
    };
    const queue = { add: vi.fn().mockResolvedValue({ id: "fake" }) };
    const service = new SubmissionsService(queue as never, queue as never, redis, billing, achievements as never);
    const dto = { problemId: problem.id, languageKey: "cpp17" as const, sourceCode: "int main(){}", clientRequestId: randomUUID() };
    return { user, problem, makeContest, queue, service, dto };
  }
  it("allows exactly one active exam when two tabs start different exams", async () => {
    const f = await fixture(); const [a, b] = await Promise.all([f.makeContest(), f.makeContest()]);
    const results = await Promise.allSettled([exams.register(a.id, f.user.id), exams.register(b.id, f.user.id)]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await prisma.contestParticipant.count({ where: { userId: f.user.id } })).toBe(1);
  });
  it("returns one attempt for concurrent duplicate starts and can restart after ending", async () => {
    const f = await fixture(); const c = await f.makeContest();
    const attempts = await Promise.all(Array.from({ length: 6 }, () => exams.register(c.id, f.user.id)));
    expect(new Set(attempts.map((p) => p.id)).size).toBe(1);
    await exams.endAttempt(c.id, f.user.id);
    const next = await exams.register(c.id, f.user.id);
    expect(next.attemptNumber).toBe(2); expect(next.id).not.toBe(attempts[0].id);
  });
  it("blocks overlapping scheduled reservations and submissions before start", async () => {
    const f = await fixture(); const c = await f.makeContest(new Date(Date.now() + 30 * 60_000));
    const attempt = await exams.register(c.id, f.user.id);
    const other = await f.makeContest(); await expect(exams.register(other.id, f.user.id)).rejects.toThrow();
    await expect(f.service.create(f.user.id, { ...f.dto, contestId: c.id, contestParticipantId: attempt.id })).rejects.toThrow();
    const detail = await exams.detail(c.id, { id: f.user.id, handle: f.user.handle, role: "USER" });
    expect(detail.problems[0].problem.statementMd).toBe("");
  });
  it("rejects stale attempts, expired windows and questions outside the exam", async () => {
    const f = await fixture(); const c = await f.makeContest(); const old = await exams.register(c.id, f.user.id);
    await exams.endAttempt(c.id, f.user.id); const active = await exams.register(c.id, f.user.id);
    await expect(f.service.create(f.user.id, { ...f.dto, contestId: c.id, contestParticipantId: old.id })).rejects.toThrow();
    const outsider = await fixture();
    await expect(f.service.create(f.user.id, { ...f.dto, problemId: outsider.problem.id, contestId: c.id, contestParticipantId: active.id })).rejects.toThrow();
    await prisma.contestParticipant.update({ where: { id: active.id }, data: { endsAt: new Date() } });
    await expect(f.service.create(f.user.id, { ...f.dto, contestId: c.id, contestParticipantId: active.id })).rejects.toThrow();
    expect((await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } })).submitQuotaUsed).toBe(0);
  });
  it("deduplicates retries atomically, charges one quota, and rejects changed payloads", async () => {
    const f = await fixture();
    const results = await Promise.all(Array.from({ length: 6 }, () => f.service.create(f.user.id, f.dto)));
    expect(new Set(results.map((r) => r.id)).size).toBe(1);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } })).submitQuotaUsed).toBe(1);
    await expect(f.service.create(f.user.id, { ...f.dto, sourceCode: "changed" })).rejects.toThrow();
    await expect(f.service.detail(results[0].id, null)).rejects.toThrow();
  });
  it("retains accepted submissions during queue outages and dispatches them after recovery", async () => {
    const f = await fixture(); f.queue.add.mockRejectedValue(new Error("queue offline"));
    const result = await f.service.create(f.user.id, f.dto);
    await expect(f.service.dispatchOne(result.id)).rejects.toThrow();
    expect((await prisma.submission.findUniqueOrThrow({ where: { id: result.id } })).queuedAt).toBeNull();
    f.queue.add.mockResolvedValue({ id: "restored" }); await f.service.dispatchOne(result.id);
    expect((await prisma.submission.findUniqueOrThrow({ where: { id: result.id } })).queuedAt).not.toBeNull();
  });
  it("recovers a durable verdict and prevents stale or timeout results from overwriting it", async () => {
    const f = await fixture(); const result = await f.service.create(f.user.id, f.dto);
    await prisma.submission.update({ where: { id: result.id }, data: { evaluationVersion: 2, pendingJudgeResult: { submissionId: result.id, evaluationVersion: 2, status: "AC" } } });
    expect((await f.service.applyJudgeResult(result.id, { submissionId: result.id, evaluationVersion: 1, status: "WA" })).applied).toBe(false);
    expect((await f.service.applyJudgeResult(result.id, { submissionId: result.id, evaluationVersion: 2, status: "SE" }, true)).applied).toBe(false);
    await new SubmissionDispatcherService(f.service).sweep();
    expect((await prisma.submission.findUniqueOrThrow({ where: { id: result.id } })).verdict).toBe("AC");
  });
  it("refunds system-error quota once, without deducting a new month's quota", async () => {
    const f = await fixture(); const result = await f.service.create(f.user.id, f.dto);
    await Promise.all(Array.from({ length: 5 }, () => f.service.applyJudgeResult(result.id, { submissionId: result.id, status: "SE" })));
    expect((await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } })).submitQuotaUsed).toBe(0);
    const prior = await prisma.submission.create({ data: { userId: f.user.id, problemId: f.problem.id, languageKey: "cpp17", sourceCode: "", quotaMonth: "2000-01" } });
    await prisma.user.update({ where: { id: f.user.id }, data: { submitQuotaMonth: currentMonthKey(), submitQuotaUsed: 3 } });
    await f.service.applyJudgeResult(prior.id, { submissionId: prior.id, status: "SE" });
    expect((await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } })).submitQuotaUsed).toBe(3);
  });
});
