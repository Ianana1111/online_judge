import type Redis from "ioredis";
import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import type { Queue } from "bullmq";
import { WORK_LIMITS, WORK_QUEUES, workKey } from "@oj/shared";
import { prisma, type Prisma } from "@oj/db";
import { JUDGE_LOCAL_QUEUE, JUDGE_REMOTE_QUEUE, TEST_RUN_QUEUE, REDIS_CLIENT } from "../common/redis.providers";

export type OperationalSnapshot = {
  measuredAt: string; status: "ok" | "attention";
  queues: { name: string; waiting: number; active: number; delayed: number; failed: number; capacity?: number; concurrency?: number | null; oldestWaitingSeconds?: number }[];
  pendingSubmissions: number; oldestPendingSeconds: number; completedLast15m: number; systemErrorsLast15m: number;
  judge?: { heartbeatAgeSeconds: number | null; rssMb: number | null; circuitOpen: boolean; sandboxes: number; runErrors15m: number; submitP95Ms: number; runP95Ms: number; waitP95Ms: number };
  redis?: { usedMb: number; maxMb: number; clients: number };
  databaseConnections?: number;
  refundReviews: number; failedAuthMail: number; alerts: string[];
};
export function operationalAlerts(input: Omit<OperationalSnapshot, "alerts" | "status" | "measuredAt">) {
  const alerts: string[] = [];
  if (input.oldestPendingSeconds > 300) alerts.push("JUDGE_PENDING_OVER_5_MINUTES");
  if (input.queues.some((q) => q.waiting > 50)) alerts.push("JUDGE_QUEUE_BACKLOG");
  if (input.systemErrorsLast15m >= 3 && input.systemErrorsLast15m / Math.max(1, input.completedLast15m) > 0.05) alerts.push("JUDGE_SYSTEM_ERROR_RATE");
  if (input.refundReviews > 0) alerts.push("REFUND_MANUAL_REVIEW");
  if (input.failedAuthMail > 0) alerts.push("ACCOUNT_MAIL_DELIVERY_FAILED");
  if (input.queues.some((q) => (q.oldestWaitingSeconds ?? 0) > 120)) alerts.push("RUN_QUEUE_WAIT_HIGH");
  if (input.judge?.heartbeatAgeSeconds === null) alerts.push("JUDGE_WORKER_UNREACHABLE");
  if (input.judge?.circuitOpen) alerts.push("SANDBOX_CIRCUIT_OPEN");
  if ((input.judge?.runErrors15m ?? 0) >= 3) alerts.push("RUN_SYSTEM_ERRORS");
  if (input.redis && (input.redis.usedMb >= 220 || input.redis.maxMb > 0 && input.redis.usedMb / input.redis.maxMb > 0.8)) alerts.push("REDIS_MEMORY_HIGH");
  return alerts;
}
@Injectable()
export class OperationsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OperationsService.name);
  private timer?: NodeJS.Timeout;
  private cached?: { until: number; value: OperationalSnapshot };
  private pending?: Promise<OperationalSnapshot>;
  constructor(@Inject(JUDGE_LOCAL_QUEUE) private readonly local: Queue, @Inject(JUDGE_REMOTE_QUEUE) private readonly remote: Queue, @Inject(TEST_RUN_QUEUE) private readonly runs: Queue, @Inject(REDIS_CLIENT) private readonly state: Redis) {}
  onModuleInit() {
    if (process.env.NODE_ENV === "test") return;
    this.timer = setInterval(() => { void this.snapshot().then((value) => { if (value.alerts.length) this.logger.warn({ event: "operational_attention", ...value }); }).catch(() => this.logger.error({ event: "operational_probe_failed" })); }, 60000);
    this.timer.unref();
  }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }
  async snapshot(): Promise<OperationalSnapshot> {
    if (this.cached && this.cached.until > Date.now()) return this.cached.value;
    if (this.pending) return this.pending;
    this.pending = this.measure();
    try { const value = await this.pending; this.cached = { until: Date.now() + 15000, value }; return value; }
    finally { this.pending = undefined; }
  }
  private async measure(): Promise<OperationalSnapshot> {
    const since = new Date(Date.now() - 15 * 60000);
    const pending: Prisma.SubmissionWhereInput = { verdict: { in: ["PENDING", "JUDGING"] } };
    const [queues, pendingSubmissions, oldest, completedLast15m, systemErrorsLast15m, refundReviews, failedAuthMail] = await Promise.all([
      Promise.all([this.local, this.remote, this.runs].map(async (queue) => { const counts = await queue.getJobCounts("wait", "active", "delayed", "failed"); return { name: queue.name, waiting: counts.wait ?? 0, active: counts.active ?? 0, delayed: counts.delayed ?? 0, failed: counts.failed ?? 0 }; })),
      prisma.submission.count({ where: pending }), prisma.submission.findFirst({ where: pending, orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
      prisma.submission.count({ where: { judgedAt: { gte: since }, verdict: { notIn: ["PENDING", "JUDGING"] } } }),
      prisma.submission.count({ where: { judgedAt: { gte: since }, verdict: "SE" } }),
      prisma.refundRequest.count({ where: { status: "NEEDS_REVIEW" } }),
      prisma.authChallenge.count({ where: { sentAt: null, consumedAt: null, deliveryAttempts: { gte: 5 }, expiresAt: { gt: new Date() } } }),
    ]);
    const redisClient = this.state;
    const [heartbeat, circuit, sandboxCount, submitMetrics, runMetrics, memory, clients, dbConnections] = await Promise.all([
      redisClient.get("oj:judge:heartbeat"), redisClient.exists("oj:judge:backoff"), redisClient.zcount("oj:sandboxes", Date.now(), "+inf"),
      redisClient.lrange("oj:metrics:submit", 0, 999), redisClient.lrange("oj:metrics:run", 0, 999), redisClient.info("memory"), redisClient.info("clients"),
      prisma.$queryRaw<{ count: number }[]>`SELECT count(*)::int AS count FROM pg_stat_activity WHERE datname = current_database()`,
    ]);
    const live = heartbeat ? JSON.parse(heartbeat) as { at: number; rssMb: number } : null;
    const metrics = (values: string[]) => values.map((v) => JSON.parse(v) as { at: number; waitMs: number; durationMs: number; failed: boolean }).filter((v) => v.at >= +since);
    const submits = metrics(submitMetrics), runs = metrics(runMetrics);
    const p95 = (values: number[]) => values.sort((a, b) => a - b)[Math.max(0, Math.ceil(values.length * .95) - 1)] ?? 0;
    const infoNumber = (info: string, key: string) => Number(info.split("\n").find((line) => line.startsWith(`${key}:`))?.split(":")[1]?.trim() ?? 0);
    const judge = { heartbeatAgeSeconds: live ? Math.round((Date.now() - live.at) / 1000) : null, rssMb: live?.rssMb ?? null, circuitOpen: !!circuit, sandboxes: sandboxCount,
      runErrors15m: runs.filter((r) => r.failed).length, submitP95Ms: p95(submits.map((m) => m.durationMs)), runP95Ms: p95(runs.map((m) => m.durationMs)), waitP95Ms: p95([...submits, ...runs].map((m) => m.waitMs)) };
    for (let i = 0; i < queues.length; i++) {
      const queue = [this.local, this.remote, this.runs][i];
      const kind = (Object.keys(WORK_QUEUES) as (keyof typeof WORK_QUEUES)[]).find((key) => WORK_QUEUES[key] === queue.name)!;
      const oldest = await queue.getJobs(["wait"], 0, 0, true);
      Object.assign(queues[i], { capacity: WORK_LIMITS[kind], concurrency: await queue.getGlobalConcurrency(), oldestWaitingSeconds: oldest[0] ? Math.round((Date.now() - oldest[0].timestamp) / 1000) : 0,
        admitted: await redisClient.zcount(workKey(kind), Date.now(), "+inf") });
    }
    const redis = { usedMb: Math.round(infoNumber(memory, "used_memory") / 1048576), maxMb: Math.round(infoNumber(memory, "maxmemory") / 1048576), clients: infoNumber(clients, "connected_clients") };
    const data = { judge, redis, databaseConnections: dbConnections[0]?.count ?? 0, queues, pendingSubmissions, oldestPendingSeconds: oldest ? Math.max(0, Math.floor((Date.now() - +oldest.createdAt) / 1000)) : 0, completedLast15m, systemErrorsLast15m, refundReviews, failedAuthMail };
    const alerts = operationalAlerts(data);
    return { measuredAt: new Date().toISOString(), status: alerts.length ? "attention" : "ok", ...data, alerts };
  }
}
