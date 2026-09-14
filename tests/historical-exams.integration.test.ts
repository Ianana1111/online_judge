import { readFileSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma, type Problem, type Contest, type ContestProblem, type TestCase } from "../packages/db/src/index";
import { createContestSchema } from "../packages/shared/src/schemas";
import { specialCheckerId } from "../packages/shared/src/judge";
import { BillingService } from "../apps/api/src/billing/billing.service";
import { ContestsService } from "../apps/api/src/contests/contests.service";
import { SubmissionsService } from "../apps/api/src/submissions/submissions.service";
import { createRedisConnection } from "../apps/api/src/common/redis.providers";

it("rejects unsupported exam scoring, duplicate labels/problems and invalid freeze windows", () => {
  const p = { problemId: "cm0abcdefghijklmnopqrstuv", label: "A" };
  const valid = { title: "Exam", slug: "test-exam", problems: [p] };
  expect(createContestSchema.safeParse(valid).success).toBe(true);
  for (const patch of [{ scoring: "SUBTASK" }, { durationMin: 30, freezeMin: 60 }, { problems: [p, p] }, { problems: [p, { ...p, problemId: "cm0abcdefghijklmnopqrstu1" }] }]) expect(createContestSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
});

type Snapshot = { contentHash: string; problems: (Problem & { testCases: TestCase[] })[]; contests: (Contest & { problems: ContestProblem[] })[] };
const path = process.env.CONTENT_SNAPSHOT_PATH;
if (path && !path.startsWith("/private/tmp/")) throw new Error("Use the private content snapshot path");
const snapshot: Snapshot | null = path ? JSON.parse(readFileSync(path, "utf8")) : null;
const historical = snapshot?.contests.filter((c) => c.kind === "CPE" || c.kind === "GPE") ?? [];

// Run on the disposable test DB only. Copies content and membership, never accounts/payments.
// Judge outcomes are synthetic here; actual candidate verdicts have their own container audit.
describe.skipIf(process.env.RUN_DB_TESTS !== "1" || !snapshot)("every archived exam from the read-only content snapshot", () => {
  const suffix = randomUUID();
  const problemIds = new Map<string, string>(), contestIds = new Map<string, string>();
  let userId: string | undefined, redis: ReturnType<typeof createRedisConnection> | undefined;
  const billing = new BillingService();
  const achievements = { awardDirect: vi.fn().mockResolvedValue(undefined), evaluateAfterAc: vi.fn().mockResolvedValue(undefined) };
  const exams = new ContestsService(billing, { getOrSet: (_key: string, _ttl: number, read: () => unknown) => read() } as never, achievements as never);
  beforeAll(async () => {
    const db = new URL(process.env.DATABASE_URL ?? "invalid:");
    if (db.hostname !== "127.0.0.1" || db.port !== "55432" || db.pathname !== "/oj_test" || process.env.REDIS_URL !== "redis://127.0.0.1:56379") throw new Error("Disposable local database and Redis required");
    if (!snapshot || createHash("sha256").update(JSON.stringify({ problems: snapshot.problems, contests: snapshot.contests })).digest("hex") !== snapshot.contentHash) throw new Error("Content snapshot hash mismatch");
    redis = createRedisConnection();
    const user = await prisma.user.create({ data: { handle: `history_${suffix}`, email: `${suffix}@example.test`, isStudent: true } }); userId = user.id;
    for (const p of snapshot.problems) problemIds.set(p.id, `c${randomUUID().replaceAll("-", "")}`);
    // Slug-registered GPE checkers require their exact identity in this isolated run.
    await prisma.problem.createMany({ data: snapshot.problems.map((p) => ({ id: problemIds.get(p.id)!, slug: specialCheckerId(p)?.startsWith("gpe-") ? p.slug : `${suffix}-${p.slug}`, title: p.title, statementMd: p.statementMd, inputSpecMd: p.inputSpecMd, outputSpecMd: p.outputSpecMd, source: p.source, visibility: p.visibility, timeLimitMs: p.timeLimitMs, memoryLimitKb: p.memoryLimitKb, checkerType: p.checkerType, floatEps: p.floatEps, uvaId: p.uvaId, uvaPid: p.uvaPid })) });
    // One real case preserves the exact local/remote routing. All case bytes are separately
    // verified by the battery audit; this suite exercises registration, ownership and scoring.
    await prisma.testCase.createMany({ data: snapshot.problems.flatMap((p) => p.testCases.slice(0, 1).map((tc) => ({ problemId: problemIds.get(p.id)!, ord: tc.ord, input: tc.input, output: tc.output }))) });
    for (const c of historical) contestIds.set(c.id, `c${randomUUID().replaceAll("-", "")}`);
    await prisma.contest.createMany({ data: historical.map((c) => ({ id: contestIds.get(c.id)!, title: c.title, slug: `${suffix}-${c.slug}`, kind: c.kind, startAt: c.startAt, durationMin: c.durationMin, freezeMin: c.freezeMin, penaltyMin: c.penaltyMin, scoring: c.scoring, isPublic: c.isPublic })) });
    await prisma.contestProblem.createMany({ data: historical.flatMap((c) => c.problems.map((cp) => ({ contestId: contestIds.get(c.id)!, problemId: problemIds.get(cp.problemId)!, label: cp.label, ord: cp.ord }))) });
  }, 60_000);
  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } });
      await prisma.contest.deleteMany({ where: { id: { in: [...contestIds.values()] } } });
      await prisma.problem.deleteMany({ where: { id: { in: [...problemIds.values()] } } });
      await redis?.del(`submit_cooldown:${userId}`);
    }
    await redis?.quit(); await prisma.$disconnect();
  });
  it.each(historical)("$slug: start, submit, score, end and retry", async (original) => {
    const id = contestIds.get(original.id)!;
    const requester = { id: userId!, handle: `history_${suffix}`, role: "USER" as const };
    const before = await exams.detail(id, requester);
    expect(before.problems).toHaveLength(original.problems.length);
    expect(before.problems.every((p) => p.problem.statementMd === "")).toBe(true);
    const attempt = await exams.register(id, userId!);
    expect(+attempt.endsAt - +attempt.startedAt).toBe(original.durationMin * 60_000);
    expect(attempt.status).toBe("RUNNING");
    expect((await exams.register(id, userId!)).id).toBe(attempt.id);
    const now = Date.now(); const startedAt = new Date(now - 120_000);
    await prisma.contestParticipant.update({ where: { id: attempt.id }, data: { startedAt, endsAt: new Date(+startedAt + original.durationMin * 60_000) } });
    const detail = await exams.detail(id, requester);
    expect(Math.abs(+detail.serverNow - Date.now())).toBeLessThan(5000);
    expect(detail.problems.every((p) => p.problem.statementMd.trim().length > 0)).toBe(true);
    await redis!.del(`submit_cooldown:${userId}`);
    const queue = { add: vi.fn().mockResolvedValue({ id: "isolated-fixture" }) };
    const submissions = new SubmissionsService(queue as never, queue as never, redis!, billing, achievements as never);
    const firstProblem = detail.problems[0].problem.id;
    const submitted = await submissions.create(userId!, { problemId: firstProblem, languageKey: "cpp17", sourceCode: "int main(){}", contestId: id, contestParticipantId: attempt.id, clientRequestId: randomUUID() });
    await prisma.submission.update({ where: { id: submitted.id }, data: { createdAt: new Date(+startedAt + 20_000) } });
    await submissions.applyJudgeResult(submitted.id, { submissionId: submitted.id, status: "WA" });
    await prisma.submission.createMany({ data: detail.problems.map((p) => ({ userId: userId!, problemId: p.problem.id, contestId: id, contestParticipantId: attempt.id, sourceCode: "synthetic completed fixture", languageKey: "cpp17", verdict: "AC", status: "AC", createdAt: new Date(+startedAt + 61_000) })) });
    const board = await exams.scoreboard(id, requester);
    expect(board.standings[0].solvedCount).toBe(original.problems.length);
    expect(board.standings[0].penalty).toBe(original.problems.length + original.penaltyMin);
    const ended = await exams.endAttempt(id, userId!); expect(ended.status).toBe("FINISHED");
    await expect(submissions.create(userId!, { problemId: firstProblem, languageKey: "cpp17", sourceCode: "int main(){}", contestId: id, contestParticipantId: attempt.id, clientRequestId: randomUUID() })).rejects.toThrow();
    const retry = await exams.register(id, userId!); expect(retry.attemptNumber).toBe(2);
    const history = await exams.detail(id, requester);
    expect(history.solvedProblemIds).toEqual([]);
    expect(history.myAttempts[0].solvedCount).toBe(original.problems.length);
    expect(history.myAttempts[1].solvedCount).toBe(0);
    await exams.endAttempt(id, userId!);
  });
});
