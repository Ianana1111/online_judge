import { BadRequestException, ConflictException, Injectable, NotFoundException, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { isDeepStrictEqual } from "node:util";
import { randomBytes } from "node:crypto";
import { prisma, Prisma } from "@oj/db";
import { OPS_AI_TASK_UNITS, repairReady, opsWorkflowResultSchema, type OpsTaskKind, type OpsTaskEvent, type OpsWorkflowTask, type OpsWorkflowResult, type OpsWorkflowDashboard } from "@oj/shared";
import { opsHash } from "./agent-ops.service";
import { taipeiDay } from "./agent-ops.policy";
import { automaticRepairPayload } from "./auto-repair.policy";
const json = (value: unknown) => value as Prisma.InputJsonValue;
const labels: Record<OpsTaskKind, string> = { VERIFY: "功能與安全巡檢", REPAIR: "隔離修復與審查", EVALUATE: "Agent 成效比較", RELEASE: "已批准的發布" };
const LEASE = 180_000, DEADLINE = 60 * 60_000;
type Row = Awaited<ReturnType<typeof prisma.agentOpsTask.findUniqueOrThrow>>;
function present(row: Row): OpsWorkflowTask { return { id: row.id, kind: row.kind as OpsTaskKind, title: row.title, status: row.status, sourceRunId: row.sourceRunId, createdAt: row.createdAt.toISOString(), completedAt: row.completedAt?.toISOString() ?? null, payload: row.payload as Record<string, unknown>, events: row.events as unknown as OpsTaskEvent[], result: row.result as unknown as OpsWorkflowResult | null, errorCode: row.errorCode, approvalDigest: row.approvalDigest, approvedAt: row.approvedAt?.toISOString() ?? null, attempts: row.attempts }; }
@Injectable()
export class OpsWorkflowService implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  get enabled() { return process.env.AGENT_OPS_WORKFLOWS_ENABLED === "true"; }
  get autoVerify() { return this.enabled && process.env.AGENT_OPS_AUTO_VERIFY !== "false"; }
  get autoRepair() { return this.enabled && process.env.AGENT_OPS_AUTO_REPAIR === "true"; }
  onModuleInit() {
    if (process.env.NODE_ENV === "test") return;
    const tick = () => void this.schedule().catch(() => {});
    this.timer = setInterval(tick, 60_000); this.timer.unref(); tick();
  }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }
  async schedule(now = new Date()) {
    if (this.autoRepair) await this.scheduleRepairs(now);
    if (!this.autoVerify || new Date(+now + 8 * 3600_000).getUTCHours() < 8) return;
    const key = `verify:${taipeiDay(now)}`;
    await prisma.agentOpsTask.upsert({ where: { requestKey: key }, create: { requestKey: key, kind: "VERIFY", title: `${taipeiDay(now)} ${labels.VERIFY}`, payload: { scheduled: true } }, update: {} });
    await prisma.agentOpsTask.updateMany({ where: { kind: "VERIFY", status: "QUEUED", createdAt: { lt: new Date(+now - 86400_000) } }, data: { status: "CANCELLED", completedAt: now } });
  }
  async scheduleRepairs(now = new Date()) {
    if (!this.autoRepair) return;
    await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(710053)`;
      if (!(await tx.agentOpsState.findUnique({ where: { id: "global" } }))?.dispatchEnabled) return;
      let pending = await tx.agentOpsTask.count({ where: { status: { in: ["QUEUED", "RUNNING", "PAUSED", "AWAITING_APPROVAL", "NEEDS_INPUT"] } } });
      const reports = await tx.agentOpsRun.findMany({ where: { kind: "INCIDENT", status: "COMPLETED", completedAt: { gte: new Date(+now - 6 * 3600_000) }, incident: { recoveredAt: null } }, include: { incident: true }, orderBy: { completedAt: "desc" }, take: 20 });
      for (const report of reports) {
        if (pending >= 12) break;
        const payload = automaticRepairPayload(report, now); if (!payload) continue;
        const requestKey = `auto-repair:${payload.incidentId}`;
        if (await tx.agentOpsTask.findUnique({ where: { requestKey } })) continue;
        await tx.agentOpsTask.create({ data: { requestKey, kind: "REPAIR", title: `自動修復評估：${report.incident!.title}`, sourceRunId: report.id, payload: json(payload) } }); pending++;
      }
    });
  }
  async dashboard(): Promise<OpsWorkflowDashboard> {
    const [tasks, verify, evaluation, approvedReleases, revertedReleases] = await Promise.all([
      prisma.agentOpsTask.findMany({ orderBy: { createdAt: "desc" }, take: 25 }),
      prisma.agentOpsTask.findFirst({ where: { kind: "VERIFY", result: { not: Prisma.JsonNull } }, orderBy: { completedAt: "desc" } }),
      prisma.agentOpsTask.findFirst({ where: { kind: "EVALUATE", result: { not: Prisma.JsonNull } }, orderBy: { completedAt: "desc" } }),
      prisma.agentOpsTask.count({ where: { kind: "RELEASE", approvedAt: { not: null } } }),
      prisma.agentOpsTask.count({ where: { kind: "RELEASE", status: "ROLLED_BACK" } }),
    ]);
    const url = process.env.JUDGEOPS_MONITOR_URL;
    return { tasks: tasks.map(present), latestVerification: verify ? present(verify) : null, evaluation: evaluation ? present(evaluation) : null, enabled: this.enabled, autoVerify: this.autoVerify, autoRepair: this.autoRepair, monitorUrl: url && /^https:\/\/[a-z0-9.-]+\.run\.app\/?$/.test(url) ? url : null, approvedReleases, revertedReleases };
  }
  async create(input: { kind: "VERIFY" | "REPAIR" | "EVALUATE"; requestId: string; sourceRunId?: string; objective?: string; files?: string[] }) {
    if (!this.enabled) throw new BadRequestException("工作流程尚未啟用。");
    if (input.sourceRunId && !(await prisma.agentOpsRun.findUnique({ where: { id: input.sourceRunId } }))) throw new NotFoundException("找不到來源報告。");
    return prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(710053)`;
    const previous = await tx.agentOpsTask.findUnique({ where: { requestKey: input.requestId } });
    if (previous) return present(previous);
    if (await tx.agentOpsTask.count({ where: { status: { in: ["QUEUED", "RUNNING", "PAUSED"] } } }) >= 12) throw new BadRequestException("待處理工作已達上限。");
    return present(await tx.agentOpsTask.create({ data: { requestKey: input.requestId, kind: input.kind, title: labels[input.kind], sourceRunId: input.sourceRunId, payload: json({ objective: input.objective ?? null, files: input.files ?? [] }) } }));
    });
  }
  private async locked<T>(id: string, fn: (tx: Prisma.TransactionClient, row: Row) => Promise<T>) {
    return prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "AgentOpsTask" WHERE id = ${id} FOR UPDATE`;
      const row = await tx.agentOpsTask.findUnique({ where: { id } }); if (!row) throw new NotFoundException();
      return fn(tx, row);
    });
  }
  private lease(row: Row, credentialId: string, lease: string) {
    if (row.status !== "RUNNING" || row.credentialId !== credentialId || row.leaseHash !== opsHash(lease) || !row.leaseUntil || +row.leaseUntil <= Date.now() || !row.deadlineAt || +row.deadlineAt <= Date.now()) throw new ConflictException("工作租約已失效。");
  }
  async claim(credentialId: string) {
    if (!this.enabled) return { task: null, reason: "DISABLED" };
    return prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(710052)`;
      const now = new Date();
      // Repair/release has external side effects: a lost lease pauses for reconciliation, never blind replay.
      await tx.agentOpsTask.updateMany({ where: { status: "RUNNING", leaseUntil: { lte: now } }, data: { status: "PAUSED", errorCode: "LEASE_EXPIRED", leaseHash: null, leaseUntil: null } });
      const state = await tx.agentOpsState.findUnique({ where: { id: "global" } });
      if (!state?.dispatchEnabled) return { task: null, reason: "DISABLED" };
      if (await tx.agentOpsTask.count({ where: { status: "RUNNING" } }) || await tx.agentOpsRun.count({ where: { status: "RUNNING", leaseUntil: { gt: now } } })) return { task: null, reason: "BUSY" };
      const candidates = await tx.agentOpsTask.findMany({ where: { status: "QUEUED", availableAt: { lte: now } }, orderBy: { createdAt: "asc" }, take: 12 });
      const used = state.budgetDay === taipeiDay(now) ? state.attemptsToday : 0;
      let row: Row | undefined;
      for (const candidate of candidates) {
        if ((candidate.payload as { automatic?: boolean }).automatic) {
          if (!this.autoRepair) continue;
          const source = candidate.sourceRunId ? await tx.agentOpsRun.findUnique({ where: { id: candidate.sourceRunId }, include: { incident: true } }) : null;
          if (!source || !automaticRepairPayload(source, now)) {
            await tx.agentOpsTask.update({ where: { id: candidate.id }, data: { status: "CANCELLED", errorCode: "SOURCE_RECOVERED_OR_STALE", completedAt: now } }); continue;
          }
        }
        if (used + OPS_AI_TASK_UNITS[candidate.kind as OpsTaskKind] <= state.dailyRunLimit) { row = candidate; break; }
      }
      if (!row) return { task: null, reason: candidates.length ? "DAILY_LIMIT" : "IDLE" };
      const lease = randomBytes(32).toString("hex");
      const claimed = await tx.agentOpsTask.update({ where: { id: row.id }, data: { status: "RUNNING", credentialId, leaseHash: opsHash(lease), leaseUntil: new Date(+now + LEASE), deadlineAt: new Date(+now + DEADLINE), attempts: { increment: 1 }, errorCode: null } });
      await tx.agentOpsState.update({ where: { id: "global" }, data: { budgetDay: taipeiDay(now), attemptsToday: used + OPS_AI_TASK_UNITS[row.kind as OpsTaskKind] } });
      await tx.agentOpsCredential.update({ where: { id: credentialId }, data: { lastSeenAt: now } });
      return { task: { task: present(claimed), lease, leaseSeconds: LEASE / 1000 } };
    });
  }
  heartbeat(id: string, credentialId: string, lease: string) { return this.locked(id, async (tx, row) => {
    this.lease(row, credentialId, lease);
    if (!(await tx.agentOpsState.findUnique({ where: { id: "global" } }))?.dispatchEnabled) throw new ConflictException("工作已暫停。");
    await tx.agentOpsTask.update({ where: { id }, data: { leaseUntil: new Date(Math.min(Date.now() + LEASE, +row.deadlineAt!)) } });
    await tx.agentOpsCredential.update({ where: { id: credentialId }, data: { lastSeenAt: new Date() } }); return { ok: true };
  }); }
  event(id: string, credentialId: string, lease: string, input: Omit<OpsTaskEvent, "at">) { return this.locked(id, async (tx, row) => {
    this.lease(row, credentialId, lease); const events = row.events as unknown as OpsTaskEvent[];
    if (input.sequence < events.length) { const { at: _at, ...saved } = events[input.sequence]; if (!isDeepStrictEqual(saved, input)) throw new ConflictException("交接資料不同。"); return { ok: true }; }
    if (input.sequence !== events.length) throw new ConflictException("交接順序不符。");
    events.push({ ...input, at: new Date().toISOString() }); await tx.agentOpsTask.update({ where: { id }, data: { events: json(events) } }); return { ok: true };
  }); }
  complete(id: string, credentialId: string, lease: string, result: OpsWorkflowResult) { return this.locked(id, async (tx, row) => {
    const hash = opsHash(JSON.stringify(result));
    if (row.resultHash === hash && row.credentialId === credentialId && row.leaseHash === opsHash(lease)) return { ok: true };
    this.lease(row, credentialId, lease);
    const valid = opsWorkflowResultSchema.parse(result);
    if (valid.outcome === "READY" && (row.kind !== "REPAIR" || !repairReady(valid))) throw new BadRequestException("修復未通過必要檢查。");
    if (["RELEASED", "ROLLED_BACK"].includes(valid.outcome) && (row.kind !== "RELEASE" || !row.approvedAt)) throw new BadRequestException("發布尚未批准。");
    const status = valid.outcome === "READY" ? "AWAITING_APPROVAL" : valid.outcome === "ROLLED_BACK" ? "ROLLED_BACK" : ["PASS", "RELEASED"].includes(valid.outcome) ? "SUCCEEDED" : valid.outcome === "NEEDS_INPUT" ? "NEEDS_INPUT" : "FAILED";
    const digest = valid.outcome === "READY" ? opsHash(`${row.id}:${valid.baseSha}:${valid.headSha}:${valid.patchHash}:${hash}`) : null;
    await tx.agentOpsTask.update({ where: { id }, data: { status, result: json(valid), resultHash: hash, approvalDigest: digest, leaseUntil: null, completedAt: new Date() } });
    return { ok: true };
  }); }
  fail(id: string, credentialId: string, lease: string, code: string) { return this.locked(id, async (tx, row) => {
    this.lease(row, credentialId, lease);
    await tx.agentOpsTask.update({ where: { id }, data: { status: "PAUSED", errorCode: code, leaseHash: null, leaseUntil: null } });
    if (["AUTH", "QUOTA"].includes(code)) await tx.agentOpsState.update({ where: { id: "global" }, data: { dispatchEnabled: false } }); return { ok: true };
  }); }
  async cancel(id: string) {
    const changed = await prisma.agentOpsTask.updateMany({ where: { id, status: { in: ["QUEUED", "PAUSED", "AWAITING_APPROVAL", "NEEDS_INPUT"] } }, data: { status: "CANCELLED", completedAt: new Date(), leaseHash: null } });
    if (!changed.count) throw new ConflictException("執行中的發布或修復須先停止執行器並核對外部狀態。"); return { ok: true };
  }
  approve(id: string, digest: string, userId: string) { return this.locked(id, async (tx, row) => {
    if (row.kind !== "REPAIR" || !row.approvalDigest || row.approvalDigest !== digest || !["AWAITING_APPROVAL", "APPROVED"].includes(row.status)) throw new ConflictException("修復內容已改變或不符合批准條件。");
    const result = opsWorkflowResultSchema.parse(row.result);
    if (!this.enabled || !repairReady(result)) throw new ConflictException("修復尚未通過必要驗證。");
    const release = await tx.agentOpsTask.upsert({ where: { requestKey: `release:${id}:${digest}` }, create: { requestKey: `release:${id}:${digest}`, kind: "RELEASE", title: labels.RELEASE, payload: json({ repairTaskId: id, result, digest }), approvedById: userId, approvedAt: new Date(), approvalDigest: digest }, update: {} });
    await tx.agentOpsTask.update({ where: { id }, data: { status: "APPROVED", approvedAt: new Date(), approvedById: userId } }); return present(release);
  }); }
}
