import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../packages/db/src/index";
import { AgentOpsService } from "../apps/api/src/agent-ops/agent-ops.service";
import { OpsWorkflowService } from "../apps/api/src/agent-ops/ops-workflow.service";
import type { OpsWorkflowClaim, OpsWorkflowResult } from "../packages/shared/src/opsWorkflow";
describe.skipIf(process.env.RUN_JUDGEOPS_DB_TESTS !== "1")("durable workflow claims and approvals", () => {
  const workflows = new OpsWorkflowService(), reports = new AgentOpsService({} as never); let credential: string;
  const empty: OpsWorkflowResult = { summary: "Fixture verification", outcome: "PASS", checks: [{ name: "fixture", status: "PASS", durationMs: 1, detail: "synthetic" }], artifacts: [], review: "NOT_REVIEWED", inputTokens: 0, outputTokens: 0, modelCalls: 0, metrics: {} };
  beforeAll(() => { const url = new URL(process.env.DATABASE_URL!); if (url.hostname !== "127.0.0.1" || url.port !== (process.env.JUDGEOPS_SANDBOX === "1" ? "55432" : "56432") || url.pathname !== "/oj_test") throw new Error("Disposable database required"); process.env.AGENT_OPS_WORKFLOWS_ENABLED = "true"; });
  async function clear() { await prisma.agentOpsTask.deleteMany(); await prisma.agentOpsRun.deleteMany(); await prisma.agentOpsIncident.deleteMany(); await prisma.agentOpsCredential.deleteMany(); await prisma.agentOpsState.deleteMany(); }
  beforeEach(async () => { await clear(); await reports.settings({ dispatchEnabled: true, dailyRunLimit: 4 }); credential = (await reports.createCredential("fixture", "owner")).id; });
  afterAll(async () => { await clear(); await prisma.$disconnect(); delete process.env.AGENT_OPS_WORKFLOWS_ENABLED; });
  const queue = (kind: "VERIFY" | "EVALUATE" | "REPAIR" = "VERIFY") => workflows.create({ requestId: randomUUID(), kind, objective: "Reproduce fixture", files: ["apps/web/lib/api.ts"] });
  async function claim() { const result = await workflows.claim(credential); expect(result.task).toBeTruthy(); return result.task as OpsWorkflowClaim; }
  it("allows only one active workflow/report across concurrent claims", async () => {
    await queue(); await queue(); await prisma.agentOpsRun.create({ data: { queueKey: randomUUID(), kind: "MANUAL", title: "fixture", evidence: [] } });
    const claims = await Promise.all(Array.from({ length: 12 }, (_,i) => i % 2 ? workflows.claim(credential) : reports.claim(credential)));
    expect(claims.filter(c => c.task)).toHaveLength(1);
  });
  it("deduplicates requests, schedules one daily verification, and completes without double billing", async () => {
    const requestId = randomUUID(), input = { kind: "VERIFY" as const, requestId };
    expect((await workflows.create(input)).id).toBe((await workflows.create(input)).id);
    const c = await claim(); await workflows.complete(c.task.id, credential, c.lease, empty); await workflows.complete(c.task.id, credential, c.lease, empty);
    expect((await reports.dashboard()).counts.startsToday).toBe(0);
    await workflows.schedule(new Date("2026-10-06T01:00:00Z")); await workflows.schedule(new Date("2026-10-06T02:00:00Z"));
    expect(await prisma.agentOpsTask.count({ where: { requestKey: "verify:2026-10-06" } })).toBe(1);
  });
  it("pauses lost leases permanently and rejects their late completion", async () => {
    await queue("REPAIR"); const c = await claim();
    await prisma.agentOpsTask.update({ where: { id: c.task.id }, data: { leaseUntil: new Date(0) } });
    expect((await workflows.claim(credential)).task).toBeNull();
    expect((await prisma.agentOpsTask.findUniqueOrThrow({ where: { id: c.task.id } })).status).toBe("PAUSED");
    await expect(workflows.complete(c.task.id, credential, c.lease, empty)).rejects.toThrow();
  });
  it("rejects missing tests and binds an idempotent owner approval to exact hashes", async () => {
    await queue("REPAIR"); const c = await claim();
    const ready: OpsWorkflowResult = { ...empty, outcome: "READY", checks: [], review: "APPROVED", headSha: "a".repeat(40), baseSha: "b".repeat(40), patchHash: "c".repeat(64), branch: "judgeops/test1", pullNumber: 1, pullUrl: "https://github.com/Ianana1111/online_judge/pull/1" };
    await expect(workflows.complete(c.task.id, credential, c.lease, ready)).rejects.toThrow();
    ready.checks = ["regression-proof", "full-suite", "qa-review", "security-review"].map(name => ({ name, status: "PASS", detail: "Fixture", durationMs: 1 }));
    await workflows.complete(c.task.id, credential, c.lease, ready);
    const task = (await workflows.dashboard()).tasks.find(t => t.id === c.task.id)!;
    await expect(workflows.approve(task.id, "d".repeat(64), "owner")).rejects.toThrow();
    const releases = await Promise.all([workflows.approve(task.id, task.approvalDigest!, "owner"), workflows.approve(task.id, task.approvalDigest!, "owner")]);
    expect(releases[0].id).toBe(releases[1].id); expect(releases[0].payload.result).toMatchObject({ headSha: ready.headSha, patchHash: ready.patchHash });
  });
  it("enforces ordered idempotent handoffs, dispatch suspension and shared evaluation budget", async () => {
    await queue("EVALUATE"); await queue("EVALUATE"); const c = await claim();
    const event = { sequence: 0, label: "fixture", detail: "synthetic", data: {} };
    await workflows.event(c.task.id, credential, c.lease, event); await workflows.event(c.task.id, credential, c.lease, event);
    await expect(workflows.event(c.task.id, credential, c.lease, { ...event, sequence: 2 })).rejects.toThrow();
    await workflows.complete(c.task.id, credential, c.lease, empty);
    expect((await workflows.claim(credential)).reason).toBe("DAILY_LIMIT");
    await queue(); const verify = await claim();
    await reports.settings({ dispatchEnabled: false, dailyRunLimit: 4 });
    await expect(workflows.heartbeat(verify.task.id, credential, verify.lease)).rejects.toThrow();
  });
});
