import { Queue } from "bullmq";
import Redis from "ioredis";
import { JUDGE_LOCAL_QUEUE_NAME, JUDGE_REMOTE_QUEUE_NAME, TEST_RUN_QUEUE_NAME } from "@oj/shared";

export const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

export const REDIS_CLIENT = "REDIS_CLIENT";
export const JUDGE_LOCAL_QUEUE = "JUDGE_LOCAL_QUEUE";
export const JUDGE_REMOTE_QUEUE = "JUDGE_REMOTE_QUEUE";
export const TEST_RUN_QUEUE = "TEST_RUN_QUEUE";

/** Shared SSE Pub/Sub connection. Skip the INFO ready-check: subscriber-mode connections
 * cannot execute INFO on Redis 7, including during reconnect/resubscription. */
export function createRedisConnection(): Redis {
  return new Redis(REDIS_URL, { maxRetriesPerRequest: 1, commandTimeout: 3000, enableReadyCheck: false });
}

export const redisClientProvider = {
  provide: REDIS_CLIENT,
  useFactory: (): Redis => new Redis(REDIS_URL, { maxRetriesPerRequest: 1, commandTimeout: 3000, enableOfflineQueue: false }),
};

// Neither queue had a cleanup policy before this — every completed AND failed job stayed in
// Redis forever, one of three unbounded-growth sources on a 500MB Redis instance (the launch
// audit's other two, page_views retention and avatar storage, are handled elsewhere). The actual
// result of a judged submission lives in Postgres already (Submission.verdict etc.), and a test
// Run's result is itself a separate, already-TTL'd Redis key (see runs.service.ts) — so a
// completed BullMQ job here has no lasting value beyond a little recent-history debugging.
// Failures are kept longer/more of them since they're exactly what you'd want to inspect when
// something in the judge pipeline is broken.
const DEFAULT_JOB_OPTIONS = {
  removeOnComplete: { age: 3600, count: 100 },
  removeOnFail: { age: 86400, count: 200 },
};

export const judgeLocalQueueProvider = {
  provide: JUDGE_LOCAL_QUEUE,
  // Pass a plain connection options object rather than constructing our own `Redis` instance
  // here: BullMQ bundles its own copy of ioredis, and a separately-installed ioredis copy (even
  // the "same" version) can resolve to a structurally distinct class under pnpm's strict
  // node_modules layout, which then fails BullMQ's ConnectionOptions type/behavior checks.
  // Letting BullMQ build its client internally sidesteps that (matches apps/judge's approach).
  useFactory: (): Queue =>
    new Queue(JUDGE_LOCAL_QUEUE_NAME, {
      connection: { url: REDIS_URL, maxRetriesPerRequest: 1, commandTimeout: 3000, enableOfflineQueue: false },
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    }),
};

export const judgeRemoteQueueProvider = {
  provide: JUDGE_REMOTE_QUEUE,
  useFactory: (): Queue =>
    new Queue(JUDGE_REMOTE_QUEUE_NAME, {
      connection: { url: REDIS_URL, maxRetriesPerRequest: 1, commandTimeout: 3000, enableOfflineQueue: false },
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    }),
};

export const testRunQueueProvider = {
  provide: TEST_RUN_QUEUE,
  useFactory: (): Queue =>
    new Queue(TEST_RUN_QUEUE_NAME, {
      connection: { url: REDIS_URL, maxRetriesPerRequest: 1, commandTimeout: 3000, enableOfflineQueue: false },
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    }),
};
