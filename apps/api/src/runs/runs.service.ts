import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { Queue } from "bullmq";
import type Redis from "ioredis";
import { prisma } from "@oj/db";
import { TEST_RUN_QUEUE_NAME, testRunResultChannel, type CreateRunDto, type TestRunResultDto } from "@oj/shared";
import { REDIS_CLIENT, TEST_RUN_QUEUE } from "../common/redis.providers";

const COOLDOWN_MS = 3_000;
// Results live in Redis only (never Postgres) — a Run is meant to be thrown away, not audited —
// so the TTL just needs to comfortably outlast "job queued, sandbox boots, code runs, client
// reconnects if its tab was backgrounded."
const RESULT_TTL_SEC = 600;

function resultKey(runId: string): string {
  return `testrun:${runId}:result`;
}

@Injectable()
export class RunsService {
  constructor(
    @Inject(TEST_RUN_QUEUE) private readonly queue: Queue,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async create(userId: string, dto: CreateRunDto): Promise<{ id: string }> {
    const problem = await prisma.problem.findUnique({ where: { id: dto.problemId }, select: { id: true } });
    if (!problem) throw new NotFoundException("Problem not found");

    // Same atomic-claim cooldown as submit (see SubmissionsService) — shorter, since Run is meant
    // for fast iterate-and-check, not a scarce resource, but a sandbox still costs real compute
    // per click.
    const claimed = await this.redis.set(`run_cooldown:${userId}`, "1", "PX", COOLDOWN_MS, "NX");
    if (!claimed) {
      throw new HttpException("You're running tests too fast — wait a moment and try again.", HttpStatus.TOO_MANY_REQUESTS);
    }

    const runId = randomUUID();
    // Seed a "still running" snapshot before the job is even picked up, so a client that opens
    // the SSE stream immediately after this response always finds *something* cached — see
    // applyResult's doc comment for why this matters (pub/sub alone has no replay).
    const pending: TestRunResultDto = { runId, status: "RUNNING" };
    await this.redis.set(resultKey(runId), JSON.stringify(pending), "EX", RESULT_TTL_SEC);

    await this.queue.add(TEST_RUN_QUEUE_NAME, {
      runId,
      problemId: dto.problemId,
      languageKey: dto.languageKey,
      sourceCode: dto.sourceCode,
      cases: dto.cases,
    });

    return { id: runId };
  }

  async getResult(runId: string): Promise<TestRunResultDto> {
    const raw = await this.redis.get(resultKey(runId));
    if (!raw) throw new NotFoundException("Run not found or expired");
    return JSON.parse(raw) as TestRunResultDto;
  }

  /** Used by the internal judge-result callback. Unlike submissions (backed by a real Postgres
   * row the SSE endpoint can always re-fetch), a Run has no persistence of its own — so this
   * caches the result in Redis *before* publishing, meaning a client whose stream connection
   * opens even a moment after the worker finishes still gets the final result instead of hanging
   * on a pub/sub message that already fired and vanished. */
  async applyResult(dto: TestRunResultDto): Promise<void> {
    await this.redis.set(resultKey(dto.runId), JSON.stringify(dto), "EX", RESULT_TTL_SEC);
    await this.redis.publish(testRunResultChannel(dto.runId), JSON.stringify(dto));
  }
}
