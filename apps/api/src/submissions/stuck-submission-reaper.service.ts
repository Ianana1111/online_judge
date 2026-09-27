import type { Queue } from "bullmq";
import { MAX_QUEUE_WAIT_MS } from "@oj/shared";
import { JUDGE_LOCAL_QUEUE, JUDGE_REMOTE_QUEUE } from "../common/redis.providers";
import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { prisma, Prisma } from "@oj/db";
import { SubmissionsService } from "./submissions.service";

const CHECK_INTERVAL_MS = 30_000;

@Injectable()
export class StuckSubmissionReaperService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StuckSubmissionReaperService.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly submissions: SubmissionsService,
    @Inject(JUDGE_LOCAL_QUEUE) private readonly local: Queue,
    @Inject(JUDGE_REMOTE_QUEUE) private readonly remote: Queue,
  ) {}

  onModuleInit(): void {
    if (process.env.NODE_ENV === "test") return;
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
      const cutoff = new Date(Date.now() - MAX_QUEUE_WAIT_MS);
      const stuck = await prisma.submission.findMany({
        where: { verdict: { in: ["PENDING", "JUDGING"] }, pendingJudgeResult: { equals: Prisma.DbNull }, createdAt: { lt: cutoff } },
        select: { id: true, evaluationVersion: true, judgedOn: true },
        take: 100, orderBy: { createdAt: "asc" },
      });
      for (const s of stuck) {
        const queue = s.judgedOn === "SELF" ? this.local : this.remote;
        const job = await queue.getJob(`${s.id}-${s.evaluationVersion}`);
        // A freshly started job may have spent almost its entire wait budget in the queue.
        if (job && await job.getState() === "active" && (job.processedOn ?? Date.now()) > Date.now() - 5 * 60_000) continue;
        await this.reapOne(s.id, s.evaluationVersion);
        if (job) await job.remove().catch(() => {});
      }
      if (stuck.length > 0) this.logger.warn(`Reaped ${stuck.length} stuck submission(s).`);
    } catch (err) {
      this.logger.warn(`Stuck-submission reaper pass failed: ${String(err)}`);
    } finally {
      this.running = false;
    }
  }

  private async reapOne(submissionId: string, evaluationVersion: number): Promise<void> {
    try {
      await this.submissions.applyJudgeResult(submissionId, {
        submissionId,
        evaluationVersion,
        status: "SE",
        compileError: "The queue wait or judging time limit was reached. Your submission quota for this attempt has been refunded — please try submitting again.",
      }, true);
      // applied === false means a real judge result actually landed between this reaper pass's
      // query and this specific update (applyJudgeResult's own conditional update lost the race)
      // — that submission judged fine, so it must NOT be refunded.
      // SE quota refunds are applied atomically by applyJudgeResult.
    } catch (err) {
      this.logger.warn(`Failed to reap submission ${submissionId}: ${String(err)}`);
    }
  }
}
