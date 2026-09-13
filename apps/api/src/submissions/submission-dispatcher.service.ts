import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { prisma, Prisma } from "@oj/db";
import { judgeResultSchema } from "@oj/shared";
import { SubmissionsService } from "./submissions.service";

@Injectable()
export class SubmissionDispatcherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SubmissionDispatcherService.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;
  constructor(private readonly submissions: SubmissionsService) {}
  onModuleInit() {
    if (process.env.NODE_ENV === "test") return;
    this.timer = setInterval(() => void this.sweep(), 5_000); this.timer.unref();
  }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }
  async sweep() {
    if (this.running) return; this.running = true;
    try {
      const results = await prisma.submission.findMany({ where: { pendingJudgeResult: { not: Prisma.DbNull }, verdict: { in: ["PENDING", "JUDGING"] } }, take: 50 });
      for (const row of results) {
        try { await this.submissions.applyJudgeResult(row.id, judgeResultSchema.parse(row.pendingJudgeResult)); }
        catch { this.logger.warn(`Saved result ${row.id} could not be applied`); }
      }
      const pending = await prisma.submission.findMany({ where: { queuedAt: null, verdict: "PENDING" }, orderBy: { createdAt: "asc" }, take: 50 });
      for (const row of pending) await this.submissions.dispatchOne(row.id);
    } catch { this.logger.warn("Queue dispatch interrupted; committed submissions will be retried"); }
    finally { this.running = false; }
  }
}
