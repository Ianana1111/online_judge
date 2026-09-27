import { BadRequestException, Inject, Injectable, NotFoundException, ServiceUnavailableException, type OnModuleInit, type OnModuleDestroy } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { Queue } from "bullmq";
import type Redis from "ioredis";
import { prisma } from "@oj/db";
import { FREE_RUN_QUOTA, TEST_RUN_QUEUE_NAME, sampleRevision, reserveWork, finishRun, workKey, MAX_QUEUE_WAIT_MS, WORK_LEASE_MS, type CreateRunDto, type TestRunResultDto } from "@oj/shared";
import { currentMonthKey, isUnlimited } from "../billing/billing.service";
import { workloadHttpError } from "../common/workload-error";
import { REDIS_CLIENT, TEST_RUN_QUEUE } from "../common/redis.providers";

function resultKey(runId: string): string {
  return `testrun:${runId}:result`;
}

function ownerKey(runId: string): string {
  return `testrun:${runId}:owner`;
}

function quotaKey(userId: string, monthKey: string): string {
  return `run_quota:${userId}:${monthKey}`;
}

@Injectable()
export class RunsService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(TEST_RUN_QUEUE) private readonly queue: Queue,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async create(userId: string, dto: CreateRunDto): Promise<{ id: string }> {
    const problem = await prisma.problem.findFirst({ where: { id: dto.problemId, visibility: true }, select: { id: true, samples: { select: { ord: true, input: true, output: true } } } });
    if (!problem) throw new NotFoundException("Problem not found");
    for (const c of dto.cases) {
      if (c.sampleOrd === undefined) continue;
      const sample = problem.samples.find((s) => s.ord === c.sampleOrd);
      if (!sample || (c.input !== undefined && c.input !== sample.input) || (c.sampleRevision !== undefined && c.sampleRevision !== await sampleRevision(sample.input, sample.output))) {
        throw new BadRequestException("Sample has changed. Reload the problem and run again.");
      }
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    const runId = randomUUID();
    try {
      await reserveWork(this.redis, "run", userId, runId, isUnlimited(user) ? undefined : { key: quotaKey(userId, currentMonthKey()), limit: FREE_RUN_QUOTA });
    } catch (error) { workloadHttpError(error); }
    try {
      await this.queue.add(TEST_RUN_QUEUE_NAME, {
        runId, problemId: dto.problemId, languageKey: dto.languageKey, sourceCode: dto.sourceCode, cases: dto.cases,
      }, { jobId: runId, attempts: 3, backoff: { type: "exponential", delay: 2000 } });
    } catch {
      await finishRun(this.redis, { runId, status: "ERROR", compileError: "Could not queue this run. Your run allowance has been restored." }).catch(() => {});
      throw new ServiceUnavailableException("Could not queue this run. Please try again shortly.");
    }

    return { id: runId };
  }

  async getResult(runId: string): Promise<TestRunResultDto> {
    const raw = await this.redis.get(resultKey(runId));
    if (!raw) throw new NotFoundException("Run not found or expired");
    return JSON.parse(raw) as TestRunResultDto;
  }

  /** A run's stdout/stderr can echo back custom input a caller typed into the "Run" panel, and
   * possibly a snippet of another user's actual source in a compile error — so the stream this
   * backs must only ever be readable by the account that created it. Same "not found" message for
   * an unowned run as for a genuinely-expired one, rather than a distinct 403, so a caller can't
   * use the response to tell "wrong owner" apart from "no such run" and go id-guessing. */
  async assertOwner(runId: string, userId: string): Promise<void> {
    const owner = await this.redis.get(ownerKey(runId));
    if (owner !== userId) throw new NotFoundException("Run not found or expired");
  }

  /** Used by the internal judge-result callback. Unlike submissions (backed by a real Postgres
   * row the SSE endpoint can always re-fetch), a Run has no persistence of its own — so this
   * caches the result in Redis *before* publishing, meaning a client whose stream connection
   * opens even a moment after the worker finishes still gets the final result instead of hanging
   * on a pub/sub message that already fired and vanished. */
  async applyResult(dto: TestRunResultDto): Promise<void> {
    await finishRun(this.redis, dto);
  }

  async usage(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    const month = currentMonthKey();
    const used = Number(await this.redis.get(quotaKey(userId, month)) ?? 0);
    const limit = isUnlimited(user) ? null : FREE_RUN_QUOTA;
    const cooldownMs = Math.max(0, await this.redis.pttl(`run_cooldown:${userId}`));
    return { month, used, limit, remaining: limit === null ? null : Math.max(0, limit - used), cooldownMs };
  }

  private timer?: NodeJS.Timeout;
  private sweeping = false;
  onModuleInit() {
    if (process.env.NODE_ENV === "test") return;
    this.timer = setInterval(() => void this.recoverExpiredRuns().catch(() => {}), 30_000);
    this.timer.unref();
  }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }

  async recoverExpiredRuns() {
    if (this.sweeping) return;
    this.sweeping = true;
    try {
      // A short, bounded scan, never KEYS or a full job-history download.
      const ids = await this.redis.zrangebyscore(workKey("run"), "-inf", Date.now() + WORK_LEASE_MS - MAX_QUEUE_WAIT_MS, "LIMIT", 0, 100);
      const stranded = await this.queue.getJobs(["wait", "delayed", "failed", "active"], 0, 99, true);
      for (const job of stranded) if (Date.now() - job.timestamp > MAX_QUEUE_WAIT_MS && job.data.runId) ids.push(job.data.runId);
      for (const id of new Set(ids)) {
        const job = await this.queue.getJob(id);
        if (job && await job.getState() === "active" && (job.processedOn ?? Date.now()) > Date.now() - 5 * 60_000) continue;
        await finishRun(this.redis, { runId: id, status: "ERROR", compileError: "This run could not finish in time. Your run allowance has been restored. Please try again." });
        if (job) await job.remove().catch(() => {});
      }
    } finally { this.sweeping = false; }
  }
}
