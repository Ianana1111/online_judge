import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import { prisma, type Prisma } from "@oj/db";
import { opsRoleForStep, validateOpsEvidence, type OpsCompleteInput, type OpsDashboard, type OpsEvidence, type OpsFailure, type OpsRun, type OpsStep } from "@oj/shared";
import { OperationsService } from "../operations/operations.service";
import { dailyReportDue, makeOpsEvidence, OPS_ALERTS, taipeiDay } from "./agent-ops.policy";

export const opsHash = (value: string) => createHash("sha256").update(value).digest("hex");
const LEASE_MS = 180_000, ATTEMPT_MS = 20 * 60_000, MAX_ATTEMPTS = 3;
const json = (v: unknown) => v as Prisma.InputJsonValue;
type StoredRun = Awaited<ReturnType<typeof prisma.agentOpsRun.findUniqueOrThrow>>;
type Receipt = { hash: string; credentialId: string; leaseHash: string };
function present(run: StoredRun): OpsRun {
  return { id: run.id, kind: run.kind, title: run.title, status: run.status, incidentId: run.incidentId, createdAt: run.createdAt.toISOString(), startedAt: run.startedAt?.toISOString() ?? null, completedAt: run.completedAt?.toISOString() ?? null, availableAt: run.availableAt.toISOString(), errorCode: run.errorCode, attempts: run.attempts, steps: run.steps as unknown as OpsStep[], evidence: run.evidence as unknown as OpsEvidence[] };
}
@Injectable()
export class AgentOpsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AgentOpsService.name);
  private timer?: NodeJS.Timeout;
  private collecting?: Promise<void>;
  constructor(private readonly operations: OperationsService) {}
  get monitorEnabled() { return process.env.AGENT_OPS_MONITOR_ENABLED === "true" || process.env.NODE_ENV === "production" && process.env.AGENT_OPS_MONITOR_ENABLED !== "false"; }
  onModuleInit() {
    if (!this.monitorEnabled) return;
    const tick = () => { void this.collect().catch(() => this.logger.error({ event: "agent_ops_collection_failed" })); };
    this.timer = setInterval(tick, 60_000); this.timer.unref(); tick();
  }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }
  private async state(tx: Prisma.TransactionClient = prisma) { return tx.agentOpsState.upsert({ where: { id: "global" }, create: { id: "global" }, update: {} }); }
  collect() {
    if (this.collecting) return this.collecting;
    this.collecting = this.collectOnce().finally(() => { this.collecting = undefined; });
    return this.collecting;
  }
  private async collectOnce() {
    const previous = await this.state();
    if (previous.lastCollectedAt && Date.now() - +previous.lastCollectedAt < 45_000) return;
    const measuredAt = new Date();
    // Snapshot failures become unknown data; no provider exception text or HTML enters a prompt.
    let timeout: NodeJS.Timeout | undefined;
    const snapshotPromise = Promise.race([
      this.operations.snapshot(), new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error("timeout")), 8_000); }),
    ]).catch(() => null).finally(() => { if (timeout) clearTimeout(timeout); });
    const [snapshot, web] = await Promise.all([snapshotPromise, this.probeWeb()]);
    const alerts = snapshot ? snapshot.alerts.filter(a => a in OPS_ALERTS) : ["OPS_SNAPSHOT_UNAVAILABLE"];
    if (snapshot?.judge && (snapshot.judge.heartbeatAgeSeconds === null || snapshot.judge.heartbeatAgeSeconds > 120) && !alerts.includes("JUDGE_WORKER_UNREACHABLE")) alerts.push("JUDGE_WORKER_UNREACHABLE");
    if (!web.ok) alerts.push("PUBLIC_WEB_UNAVAILABLE");
    await this.recordObservation(makeOpsEvidence(snapshot, web, measuredAt), alerts, !snapshot, measuredAt);
  }
  private async probeWeb() {
    const started = Date.now();
    try {
      const target = new URL((process.env.WEB_ORIGIN ?? "http://localhost:3000").split(",")[0].trim());
      const response = await fetch(target.origin, { redirect: "manual", signal: AbortSignal.timeout(5_000), headers: { "user-agent": "JudgeOps-Health/1.0" } });
      await response.body?.cancel();
      return { ok: response.status === 200, status: response.status, durationMs: Date.now() - started };
    } catch { return { ok: false, status: null, durationMs: Date.now() - started }; }
  }
  async recordObservation(evidence: OpsEvidence[], alertCodes: string[], monitorError: boolean, measuredAt = new Date()) {
    const alerts = [...new Set(alertCodes.filter(code => code in OPS_ALERTS))];
    await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(710051)`;
      const state = await this.state(tx);
      // Multiple API replicas must not count near-identical samples as separate recovery checks.
      if (state.lastCollectedAt && +measuredAt - +state.lastCollectedAt < 45_000) return;
      await tx.agentOpsState.update({ where: { id: "global" }, data: { lastCollectedAt: measuredAt, monitorError, snapshot: json(evidence) } });
      const open = await tx.agentOpsIncident.findMany({ where: { recoveredAt: null }, take: 100 });
      for (const incident of open) {
        if (alerts.includes(incident.code)) continue;
        // Missing metrics cannot establish that backend incidents have recovered.
        if (monitorError && !["PUBLIC_WEB_UNAVAILABLE", "OPS_SNAPSHOT_UNAVAILABLE"].includes(incident.code)) continue;
        const recovered = incident.healthyChecks + 1 >= 3;
        await tx.agentOpsIncident.update({ where: { id: incident.id }, data: { healthyChecks: { increment: 1 }, ...(recovered ? { recoveredAt: measuredAt, activeKey: null } : {}) } });
      }
      for (const code of alerts) {
        const meta = OPS_ALERTS[code];
        const incident = await tx.agentOpsIncident.upsert({ where: { activeKey: code }, create: { activeKey: code, code, ...meta, firstSeenAt: measuredAt, lastSeenAt: measuredAt }, update: { lastSeenAt: measuredAt, healthyChecks: 0 } });
        // One automatic investigation per incident, even if the alert persists for days.
        if (state.dispatchEnabled) await tx.agentOpsRun.upsert({ where: { queueKey: `incident:${incident.id}` }, create: { queueKey: `incident:${incident.id}`, kind: "INCIDENT", title: meta.title, incidentId: incident.id, evidence: json(evidence) }, update: {} });
      }
      if (state.dispatchEnabled && dailyReportDue(measuredAt)) {
        const day = taipeiDay(measuredAt);
        await tx.agentOpsRun.upsert({ where: { queueKey: `daily:${day}` }, create: { queueKey: `daily:${day}`, kind: "DAILY", title: `${day} 每日維運摘要`, evidence: json(evidence) }, update: {} });
      }
      // Daily summaries are useful for the day they describe, not a backlog after a long outage.
      await tx.agentOpsRun.updateMany({ where: { kind: "DAILY", status: "QUEUED", createdAt: { lt: new Date(+measuredAt - 86400_000) } }, data: { status: "CANCELLED", completedAt: measuredAt } });
    });
  }
  async dashboard(): Promise<OpsDashboard> {
    const now = new Date(), since = new Date(+now - 86400_000);
    const [state, credentials, incidents, runs, queued, running, paused, completed24h, openIncidents] = await Promise.all([
      this.state(), prisma.agentOpsCredential.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
      prisma.agentOpsIncident.findMany({ orderBy: [{ recoveredAt: "desc" }, { lastSeenAt: "desc" }], take: 30 }),
      prisma.agentOpsRun.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
      prisma.agentOpsRun.count({ where: { status: "QUEUED" } }), prisma.agentOpsRun.count({ where: { status: "RUNNING" } }),
      prisma.agentOpsRun.count({ where: { status: "PAUSED" } }), prisma.agentOpsRun.count({ where: { status: "COMPLETED", completedAt: { gte: since } } }),
      prisma.agentOpsIncident.count({ where: { recoveredAt: null } }),
    ]);
    const fresh = state.lastCollectedAt && +now - +state.lastCollectedAt < 180_000;
    return { measuredAt: now.toISOString(), settings: { dispatchEnabled: state.dispatchEnabled, dailyRunLimit: state.dailyRunLimit },
      monitor: { enabled: this.monitorEnabled, lastCollectedAt: state.lastCollectedAt?.toISOString() ?? null, error: state.monitorError, healthy: fresh && !state.monitorError ? openIncidents === 0 : null },
      counts: { queued, running, paused, completed24h, openIncidents, startsToday: state.budgetDay === taipeiDay(now) ? state.attemptsToday : 0 },
      credentials: credentials.map(c => ({ id: c.id, name: c.name, createdAt: c.createdAt.toISOString(), expiresAt: c.expiresAt.toISOString(), lastSeenAt: c.lastSeenAt?.toISOString() ?? null, revokedAt: c.revokedAt?.toISOString() ?? null })),
      incidents: incidents.map(i => ({ id: i.id, code: i.code, title: i.title, severity: i.severity, firstSeenAt: i.firstSeenAt.toISOString(), lastSeenAt: i.lastSeenAt.toISOString(), recoveredAt: i.recoveredAt?.toISOString() ?? null })), runs: runs.map(present),
    };
  }
  async settings(input: { dispatchEnabled: boolean; dailyRunLimit: number }) { return prisma.agentOpsState.upsert({ where: { id: "global" }, create: { id: "global", ...input }, update: input }); }
  async createCredential(name: string, createdById: string) {
    return prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(710053)`;
      if (await tx.agentOpsCredential.count({ where: { revokedAt: null, expiresAt: { gt: new Date() } } }) >= 5) throw new BadRequestException("最多五個有效執行器，請先撤銷不再使用的憑證。");
      const token = `jo_${randomBytes(32).toString("hex")}`;
      const record = await tx.agentOpsCredential.create({ data: { name, createdById, tokenHash: opsHash(token), expiresAt: new Date(Date.now() + 90 * 86400_000) } });
      return { id: record.id, token, expiresAt: record.expiresAt };
    });
  }
  async revoke(id: string) { await prisma.agentOpsCredential.updateMany({ where: { id, revokedAt: null }, data: { revokedAt: new Date() } }); return { ok: true }; }
  async manual(requestId: string) {
    const state = await this.state();
    if (!state.snapshot || !state.lastCollectedAt || Date.now() - +state.lastCollectedAt > 180_000) throw new BadRequestException("監控資料尚未就緒或已過期，請先重新收集。");
    if (await prisma.agentOpsRun.count({ where: { status: { in: ["QUEUED", "RUNNING", "PAUSED"] } } }) >= 30) throw new BadRequestException("待處理工作已達上限。");
    const run = await prisma.agentOpsRun.upsert({ where: { queueKey: `manual:${requestId}` }, create: { queueKey: `manual:${requestId}`, kind: "MANUAL", title: "手動維運檢查", evidence: state.snapshot as Prisma.InputJsonValue }, update: {} });
    return present(run);
  }
  async retry(id: string) {
    const updated = await prisma.agentOpsRun.updateMany({ where: { id, status: { in: ["PAUSED", "FAILED"] } }, data: { status: "QUEUED", availableAt: new Date(), attempts: 0, errorCode: null, completedAt: null, leaseHash: null, leaseUntil: null, attemptDeadline: null } });
    if (!updated.count) throw new ConflictException("只有已暫停或失敗的工作可以重試。");
    return { ok: true };
  }
  async cancel(id: string) {
    const updated = await prisma.agentOpsRun.updateMany({ where: { id, status: { in: ["QUEUED", "RUNNING", "PAUSED"] } }, data: { status: "CANCELLED", completedAt: new Date(), leaseHash: null, leaseUntil: null } });
    if (!updated.count) throw new ConflictException("工作已結束。");
    return { ok: true };
  }
  async claim(credentialId: string) {
    return prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(710052)`;
      const now = new Date(), state = await this.state(tx);
      await tx.agentOpsCredential.update({ where: { id: credentialId }, data: { lastSeenAt: now } });
      await tx.agentOpsRun.updateMany({ where: { status: "RUNNING", leaseUntil: { lte: now }, attempts: { gte: MAX_ATTEMPTS } }, data: { status: "FAILED", errorCode: "LEASE_EXPIRED", completedAt: now, leaseHash: null, leaseUntil: null } });
      await tx.agentOpsRun.updateMany({ where: { status: "RUNNING", leaseUntil: { lte: now }, attempts: { lt: MAX_ATTEMPTS } }, data: { status: "QUEUED", errorCode: "LEASE_EXPIRED", availableAt: now, leaseHash: null, leaseUntil: null } });
      if (!state.dispatchEnabled) return { task: null, reason: "DISABLED", retryAfterSeconds: 30 };
      const today = taipeiDay(now), used = state.budgetDay === today ? state.attemptsToday : 0;
      if (used >= state.dailyRunLimit) return { task: null, reason: "DAILY_LIMIT", retryAfterSeconds: 300 };
      // Initial deployment deliberately permits just one active investigation globally.
      if (await tx.agentOpsRun.count({ where: { status: "RUNNING" } })) return { task: null, reason: "BUSY", retryAfterSeconds: 30 };
      const run = await tx.agentOpsRun.findFirst({ where: { status: "QUEUED", availableAt: { lte: now } }, orderBy: { createdAt: "asc" } });
      if (!run) return { task: null, reason: "IDLE", retryAfterSeconds: 30 };
      const lease = randomBytes(32).toString("hex");
      const claimed = await tx.agentOpsRun.update({ where: { id: run.id }, data: { status: "RUNNING", credentialId, leaseHash: opsHash(lease), leaseUntil: new Date(+now + LEASE_MS), attemptDeadline: new Date(+now + ATTEMPT_MS), startedAt: run.startedAt ?? now, attempts: { increment: 1 }, errorCode: null } });
      await tx.agentOpsState.update({ where: { id: "global" }, data: { budgetDay: today, attemptsToday: used + 1 } });
      const task = present(claimed);
      return { task: { run: task, lease, leaseSeconds: LEASE_MS / 1000, step: task.steps.length, role: opsRoleForStep(task.steps.length, task.steps) }, retryAfterSeconds: 30 };
    });
  }
  private async locked<T>(id: string, fn: (tx: Prisma.TransactionClient, run: StoredRun) => Promise<T>): Promise<T> {
    return prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "AgentOpsRun" WHERE id = ${id} FOR UPDATE`;
      const run = await tx.agentOpsRun.findUnique({ where: { id } });
      if (!run) throw new NotFoundException();
      return fn(tx, run);
    });
  }
  private assertLease(run: StoredRun, credentialId: string, lease: string) {
    if (run.status !== "RUNNING" || run.credentialId !== credentialId || run.leaseHash !== opsHash(lease) || !run.leaseUntil || +run.leaseUntil <= Date.now() || !run.attemptDeadline || +run.attemptDeadline <= Date.now()) throw new ConflictException("任務租約已失效。");
  }
  async heartbeat(id: string, credentialId: string, lease: string) {
    return this.locked(id, async (tx, run) => {
      this.assertLease(run, credentialId, lease);
      if (!(await this.state(tx)).dispatchEnabled) throw new ConflictException("執行已暫停。");
      await tx.agentOpsRun.update({ where: { id }, data: { leaseUntil: new Date(Math.min(Date.now() + LEASE_MS, +run.attemptDeadline!)) } });
      await tx.agentOpsCredential.update({ where: { id: credentialId }, data: { lastSeenAt: new Date() } });
      return { ok: true };
    });
  }
  async complete(id: string, credentialId: string, input: OpsCompleteInput) {
    return this.locked(id, async (tx, run) => {
      const steps = run.steps as unknown as OpsStep[], receipts = run.stepReceipts as unknown as Receipt[];
      const hash = opsHash(JSON.stringify({ output: input.output, inputTokens: input.inputTokens, outputTokens: input.outputTokens, model: input.model }));
      const receipt = receipts[input.step];
      if (receipt && receipt.hash === hash && receipt.credentialId === credentialId && receipt.leaseHash === opsHash(input.lease)) return { ok: true, done: steps.length === 3, step: steps.length };
      this.assertLease(run, credentialId, input.lease);
      if (input.step !== steps.length) throw new ConflictException("工作階段不符。");
      const role = opsRoleForStep(input.step, steps);
      try { validateOpsEvidence(input.output, run.evidence as unknown as OpsEvidence[], role); } catch { throw new BadRequestException("回覆的證據或審查階段不符。"); }
      steps.push({ role, output: input.output, inputTokens: input.inputTokens, outputTokens: input.outputTokens, model: input.model, completedAt: new Date().toISOString() });
      receipts.push({ hash, credentialId, leaseHash: opsHash(input.lease) });
      const done = steps.length === 3;
      await tx.agentOpsRun.update({ where: { id }, data: { steps: json(steps), stepReceipts: json(receipts), ...(done ? { status: "COMPLETED", completedAt: new Date(), leaseHash: null, leaseUntil: null, attemptDeadline: null } : {}) } });
      return { ok: true, done, step: steps.length };
    });
  }
  async fail(id: string, credentialId: string, lease: string, code: OpsFailure) {
    return this.locked(id, async (tx, run) => {
      this.assertLease(run, credentialId, lease);
      const status = ["QUOTA", "AUTH", "INVALID_OUTPUT"].includes(code) ? "PAUSED" : run.attempts >= MAX_ATTEMPTS ? "FAILED" : "QUEUED";
      await tx.agentOpsRun.update({ where: { id }, data: { status, errorCode: code, leaseHash: null, leaseUntil: null, attemptDeadline: null, availableAt: new Date(Date.now() + 300_000), completedAt: status === "FAILED" ? new Date() : null } });
      // A quota/auth failure affects every task sharing the subscription. Do not consume the next task.
      if (["QUOTA", "AUTH"].includes(code)) await tx.agentOpsState.update({ where: { id: "global" }, data: { dispatchEnabled: false } });
      return { ok: true };
    });
  }
}
