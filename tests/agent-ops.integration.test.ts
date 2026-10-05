import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../packages/db/src/index";
import { AgentOpsService, opsHash } from "../apps/api/src/agent-ops/agent-ops.service";
import { AgentOpsTokenGuard } from "../apps/api/src/agent-ops/agent-ops.controller";
import { opsRoleForStep, type OpsClaim, type OpsCompleteInput, type OpsEvidence } from "../packages/shared/src/agentOps";

describe.skipIf(process.env.RUN_JUDGEOPS_DB_TESTS !== "1")("JudgeOps durable orchestration with PostgreSQL", () => {
  const ops = new AgentOpsService({} as never);
  const evidence: OpsEvidence[] = [{ id: "judge", label: "Worker", observedAt: new Date().toISOString(), data: { heartbeatAgeSeconds: 200 } }];
  let credentialId: string, token: string;
  beforeAll(() => {
    const url = new URL(process.env.DATABASE_URL ?? "invalid:");
    if (url.hostname !== "127.0.0.1" || url.port !== "56432" || url.pathname !== "/oj_test") throw new Error("Dedicated JudgeOps disposable database required");
  });
  beforeEach(async () => {
    await prisma.agentOpsRun.deleteMany(); await prisma.agentOpsIncident.deleteMany(); await prisma.agentOpsCredential.deleteMany(); await prisma.agentOpsState.deleteMany();
    await ops.settings({ dispatchEnabled: true, dailyRunLimit: 20 });
    const result = await ops.createCredential("test runner", "test-owner"); token = result.token; credentialId = result.id;
  });
  afterAll(async () => { await prisma.agentOpsRun.deleteMany(); await prisma.agentOpsIncident.deleteMany(); await prisma.agentOpsCredential.deleteMany(); await prisma.agentOpsState.deleteMany(); await prisma.$disconnect(); });
  async function queue() { return prisma.agentOpsRun.create({ data: { queueKey: randomUUID(), kind: "MANUAL", title: "Test incident", evidence } }); }
  async function claim() { const result = await ops.claim(credentialId); expect(result.task).toBeTruthy(); return result.task as OpsClaim; }
  function result(task: OpsClaim, step = task.step): OpsCompleteInput { return { step, lease: task.lease, model: "fixture-model", inputTokens: 200, outputTokens: 100, output: { summary: "心跳過期，需要調查。", specialist: "SRE", findings: [{ text: "心跳 200 秒未更新。", evidenceIds: ["judge"] }], hypotheses: ["worker 可能停止，尚未確認"], actions: [{ title: "檢查 worker", detail: "核對服務狀態及部署紀錄。", risk: "READ_ONLY" }], limitations: ["未取得服務日誌"], review: step === 2 ? "SUPPORTED" : "NOT_REVIEWED" } }; }
  it("stores only hashed credentials, hides lease material, and rejects expiry/revocation", async () => {
    const guard = new AgentOpsTokenGuard();
    const context = (value: string) => ({ switchToHttp: () => ({ getRequest: () => ({ headers: { authorization: value } }) }) }) as never;
    expect(await guard.canActivate(context(`Bearer ${token}`))).toBe(true);
    const stored = await prisma.agentOpsCredential.findUniqueOrThrow({ where: { id: credentialId } });
    expect(stored.tokenHash).toBe(opsHash(token)); expect(JSON.stringify(await ops.dashboard())).not.toContain(token);
    await expect(guard.canActivate(context("Bearer jo_" + "a".repeat(64)))).rejects.toThrow();
    await prisma.agentOpsCredential.update({ where: { id: credentialId }, data: { expiresAt: new Date(0) } });
    await expect(guard.canActivate(context(`Bearer ${token}`))).rejects.toThrow();
    await prisma.agentOpsCredential.update({ where: { id: credentialId }, data: { expiresAt: new Date(Date.now() + 60_000) } });
    await ops.revoke(credentialId); await expect(guard.canActivate(context(`Bearer ${token}`))).rejects.toThrow();
  });
  it("deduplicates incidents, requires three healthy samples, and does not treat missing metrics as recovery", async () => {
    const base = Date.now() - 600_000;
    for (let i = 0; i < 3; i++) await ops.recordObservation(evidence, ["JUDGE_WORKER_UNREACHABLE"], false, new Date(base + i * 60_000));
    expect(await prisma.agentOpsIncident.count()).toBe(1);
    expect(await prisma.agentOpsRun.count({ where: { kind: "INCIDENT" } })).toBe(1);
    await ops.recordObservation(evidence, ["OPS_SNAPSHOT_UNAVAILABLE"], true, new Date(base + 180_000));
    expect((await prisma.agentOpsIncident.findFirstOrThrow({ where: { code: "JUDGE_WORKER_UNREACHABLE" } })).healthyChecks).toBe(0);
    for (let i = 4; i < 6; i++) await ops.recordObservation(evidence, [], false, new Date(base + i * 60_000));
    expect((await prisma.agentOpsIncident.findFirstOrThrow({ where: { code: "JUDGE_WORKER_UNREACHABLE" } })).recoveredAt).toBeNull();
    await ops.recordObservation(evidence, [], false, new Date(base + 360_000));
    expect((await prisma.agentOpsIncident.findFirstOrThrow({ where: { code: "JUDGE_WORKER_UNREACHABLE" } })).recoveredAt).not.toBeNull();
    await ops.recordObservation(evidence, ["JUDGE_WORKER_UNREACHABLE"], false, new Date(base + 420_000));
    expect(await prisma.agentOpsIncident.count({ where: { code: "JUDGE_WORKER_UNREACHABLE" } })).toBe(2);
  });
  it("ignores out-of-order monitor samples and creates one daily report per Taipei day", async () => {
    const now = new Date("2026-10-05T02:00:00Z");
    await ops.recordObservation(evidence, [], false, now);
    await ops.recordObservation(evidence, ["JUDGE_WORKER_UNREACHABLE"], false, new Date(+now - 1));
    await ops.recordObservation(evidence, [], false, new Date(+now + 60_000));
    expect(await prisma.agentOpsIncident.count()).toBe(0);
    expect(await prisma.agentOpsRun.count({ where: { kind: "DAILY" } })).toBe(1);
  });
  it("claims only one job across simultaneous workers and enforces the global daily budget", async () => {
    await queue(); await queue(); await ops.settings({ dispatchEnabled: true, dailyRunLimit: 1 });
    const claims = await Promise.all(Array.from({ length: 12 }, () => ops.claim(credentialId)));
    const task = claims.find(c => c.task)?.task as OpsClaim;
    expect(claims.filter(c => c.task)).toHaveLength(1);
    for (let step = 0; step < 3; step++) await ops.complete(task.run.id, credentialId, result(task, step));
    expect(await ops.claim(credentialId)).toMatchObject({ task: null, reason: "DAILY_LIMIT" });
    expect(JSON.stringify(await ops.dashboard())).not.toContain(task.lease);
  });
  it("persists stage handoffs and accepts duplicate completion without rerunning or double accounting", async () => {
    const run = await queue(), task = await claim();
    const first = result(task);
    await ops.complete(run.id, credentialId, first);
    await ops.complete(run.id, credentialId, first);
    expect((await prisma.agentOpsRun.findUniqueOrThrow({ where: { id: run.id } })).steps).toHaveLength(1);
    await expect(ops.complete(run.id, credentialId, { ...first, outputTokens: 999 })).rejects.toThrow();
    await ops.complete(run.id, credentialId, result(task, 1));
    await ops.complete(run.id, credentialId, result(task, 2));
    expect(await ops.complete(run.id, credentialId, result(task, 2))).toMatchObject({ done: true, step: 3 });
    const saved = await prisma.agentOpsRun.findUniqueOrThrow({ where: { id: run.id } });
    expect(saved.status).toBe("COMPLETED"); expect(saved.leaseHash).toBeNull();
    expect((saved.steps as unknown as { role: string }[]).map(s => s.role)).toEqual(["TRIAGE", "SRE", "REVIEW"]);
  });
  it("reclaims an expired lease at the saved stage and fences out the old executor", async () => {
    const run = await queue(), old = await claim();
    await ops.complete(run.id, credentialId, result(old));
    await prisma.agentOpsRun.update({ where: { id: run.id }, data: { leaseUntil: new Date(0) } });
    const next = await claim(); expect(next.step).toBe(1); expect(next.role).toBe("SRE"); expect(next.lease).not.toBe(old.lease);
    await expect(ops.heartbeat(run.id, credentialId, old.lease)).rejects.toThrow();
    await expect(ops.complete(run.id, credentialId, result(old, 1))).rejects.toThrow();
    await ops.complete(run.id, credentialId, result(next, 1));
    expect(opsRoleForStep(2, [])).toBe("REVIEW");
  });
  it("rejects wrong owners, unknown evidence, skipped review stages, and expired attempt deadlines", async () => {
    const run = await queue(), task = await claim();
    await expect(ops.heartbeat(run.id, "other", task.lease)).rejects.toThrow();
    await expect(ops.complete(run.id, credentialId, result(task, 2))).rejects.toThrow();
    const fabricated = result(task); fabricated.output.findings[0].evidenceIds = ["invented"];
    await expect(ops.complete(run.id, credentialId, fabricated)).rejects.toThrow();
    await prisma.agentOpsRun.update({ where: { id: run.id }, data: { attemptDeadline: new Date(0) } });
    await expect(ops.heartbeat(run.id, credentialId, task.lease)).rejects.toThrow();
  });
  it("pauses all inference on quota failure while retaining successful stages", async () => {
    const run = await queue(), task = await claim(); await queue();
    await ops.complete(run.id, credentialId, result(task));
    await ops.fail(run.id, credentialId, task.lease, "QUOTA");
    expect(await ops.claim(credentialId)).toMatchObject({ task: null, reason: "DISABLED" });
    const saved = await prisma.agentOpsRun.findUniqueOrThrow({ where: { id: run.id } });
    expect(saved.status).toBe("PAUSED"); expect(saved.steps).toHaveLength(1);
    await ops.retry(run.id); expect(await ops.claim(credentialId)).toMatchObject({ task: null, reason: "DISABLED" });
    await ops.settings({ dispatchEnabled: true, dailyRunLimit: 20 });
    expect((await claim()).step).toBe(1);
  });
  it("cancels in-flight work and never allows a late result to revive it", async () => {
    const run = await queue(), task = await claim(); await ops.cancel(run.id);
    await expect(ops.complete(run.id, credentialId, result(task))).rejects.toThrow();
    await expect(ops.retry(run.id)).rejects.toThrow();
    expect((await prisma.agentOpsRun.findUniqueOrThrow({ where: { id: run.id } })).status).toBe("CANCELLED");
  });
  it("requires fresh evidence for manual runs and deduplicates request retries", async () => {
    await expect(ops.manual(randomUUID())).rejects.toThrow();
    await ops.recordObservation(evidence, [], false);
    const requestId = randomUUID();
    expect((await ops.manual(requestId)).id).toBe((await ops.manual(requestId)).id);
    await prisma.agentOpsState.update({ where: { id: "global" }, data: { lastCollectedAt: new Date(0) } });
    await expect(ops.manual(randomUUID())).rejects.toThrow();
    expect((await ops.dashboard()).monitor.healthy).toBeNull();
  });
});
