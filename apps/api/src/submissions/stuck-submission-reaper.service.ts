import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { prisma } from "@oj/db";
import { BillingService } from "../billing/billing.service";
import { SubmissionsService } from "./submissions.service";

const CHECK_INTERVAL_MS = 5 * 60 * 1000;
// A submission stuck this long in PENDING/JUDGING means either the judge worker crashed after
// claiming the job (BullMQ's own retry gives up after one attempt — see worker.ts's default
// attempts of 1 — so nothing else was ever going to finish it), or it was created but the Redis
// enqueue itself never happened (a Redis blip between the row insert and the queue add in
// SubmissionsService.create). Either way, nothing is coming; leaving it PENDING/JUDGING forever
// means the SSE stream hangs open indefinitely and the user's quota stays spent for nothing.
const STUCK_THRESHOLD_MS = 15 * 60 * 1000;

@Injectable()
export class StuckSubmissionReaperService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StuckSubmissionReaperService.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly billing: BillingService,
    private readonly submissions: SubmissionsService,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => void this.reapOnce(), CHECK_INTERVAL_MS);
    void this.reapOnce();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async reapOnce(): Promise<void> {
    if (this.running) return; // a slow previous pass is still in flight
    this.running = true;
    try {
      const cutoff = new Date(Date.now() - STUCK_THRESHOLD_MS);
      const stuck = await prisma.submission.findMany({
        where: { verdict: { in: ["PENDING", "JUDGING"] }, createdAt: { lt: cutoff } },
        select: { id: true, userId: true },
      });
      for (const s of stuck) {
        await this.reapOne(s.id, s.userId);
      }
      if (stuck.length > 0) this.logger.warn(`Reaped ${stuck.length} stuck submission(s).`);
    } catch (err) {
      this.logger.warn(`Stuck-submission reaper pass failed: ${String(err)}`);
    } finally {
      this.running = false;
    }
  }

  private async reapOne(submissionId: string, userId: string): Promise<void> {
    try {
      const { applied } = await this.submissions.applyJudgeResult(submissionId, {
        submissionId,
        status: "SE",
        compileError: "Judging timed out and was automatically cancelled. Your submission quota for this attempt has been refunded — please try submitting again.",
      });
      // applied === false means a real judge result actually landed between this reaper pass's
      // query and this specific update (applyJudgeResult's own conditional update lost the race)
      // — that submission judged fine, so it must NOT be refunded.
      if (applied) await this.billing.refundSubmitQuota(userId);
    } catch (err) {
      this.logger.warn(`Failed to reap submission ${submissionId}: ${String(err)}`);
    }
  }
}
