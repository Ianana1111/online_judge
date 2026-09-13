import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { prisma } from "@oj/db";
import { BillingService } from "./billing.service";

@Injectable()
export class RefundProcessorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RefundProcessorService.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(private readonly billing: BillingService) {}

  onModuleInit() {
    if (process.env.NODE_ENV === "test") return;
    this.timer = setInterval(() => void this.sweep(), 30_000);
    this.timer.unref();
  }

  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }

  async sweep() {
    if (this.running) return;
    this.running = true;
    try {
      // A process may have died after a bank action but before persisting its outcome.
      // Never send that action again without reconciliation.
      const stale = await prisma.refundRequest.updateMany({
        where: { status: "PROCESSING", updatedAt: { lt: new Date(Date.now() - 5 * 60_000) } },
        data: { status: "NEEDS_REVIEW", processingToken: null, lastError: "Worker interrupted; verify gateway outcome before retrying" },
      });
      if (stale.count) this.logger.error(`${stale.count} interrupted refunds require reconciliation`);
      const due = await prisma.refundRequest.findMany({
        where: { status: "REQUESTED", nextAttemptAt: { lte: new Date() } },
        orderBy: { requestedAt: "asc" }, take: 10, select: { id: true },
      });
      for (const request of due) await this.billing.processRefund(request.id);
    } catch (error) {
      this.logger.error(`Refund processor failed: ${error instanceof Error ? error.message : "unknown error"}`);
    } finally { this.running = false; }
  }
}
