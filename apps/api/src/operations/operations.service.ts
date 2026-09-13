import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import type { Queue } from "bullmq";
import { prisma, type Prisma } from "@oj/db";
import { JUDGE_LOCAL_QUEUE, JUDGE_REMOTE_QUEUE, TEST_RUN_QUEUE } from "../common/redis.providers";

export type OperationalSnapshot = {
  measuredAt: string; status: "ok" | "attention";
  queues: { name: string; waiting: number; active: number; delayed: number; failed: number }[];
  pendingSubmissions: number; oldestPendingSeconds: number; completedLast15m: number; systemErrorsLast15m: number;
  refundReviews: number; failedAuthMail: number; alerts: string[];
};
export function operationalAlerts(input: Omit<OperationalSnapshot, "alerts" | "status" | "measuredAt">) {
  const alerts: string[] = [];
  if (input.oldestPendingSeconds > 300) alerts.push("JUDGE_PENDING_OVER_5_MINUTES");
  if (input.queues.some((q) => q.waiting > 50)) alerts.push("JUDGE_QUEUE_BACKLOG");
  if (input.systemErrorsLast15m >= 3 && input.systemErrorsLast15m / Math.max(1, input.completedLast15m) > 0.05) alerts.push("JUDGE_SYSTEM_ERROR_RATE");
  if (input.refundReviews > 0) alerts.push("REFUND_MANUAL_REVIEW");
  if (input.failedAuthMail > 0) alerts.push("ACCOUNT_MAIL_DELIVERY_FAILED");
  return alerts;
}
@Injectable()
export class OperationsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OperationsService.name);
  private timer?: NodeJS.Timeout;
  private cached?: { until: number; value: OperationalSnapshot };
  private pending?: Promise<OperationalSnapshot>;
  constructor(@Inject(JUDGE_LOCAL_QUEUE) private readonly local: Queue, @Inject(JUDGE_REMOTE_QUEUE) private readonly remote: Queue, @Inject(TEST_RUN_QUEUE) private readonly runs: Queue) {}
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
    const data = { queues, pendingSubmissions, oldestPendingSeconds: oldest ? Math.max(0, Math.floor((Date.now() - +oldest.createdAt) / 1000)) : 0, completedLast15m, systemErrorsLast15m, refundReviews, failedAuthMail };
    const alerts = operationalAlerts(data);
    return { measuredAt: new Date().toISOString(), status: alerts.length ? "attention" : "ok", ...data, alerts };
  }
}
