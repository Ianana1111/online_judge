import { Queue } from "bullmq";
import Redis from "ioredis";
import { JUDGE_QUEUE_NAME } from "@oj/shared";

export const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

export const REDIS_CLIENT = "REDIS_CLIENT";
export const JUDGE_QUEUE = "JUDGE_QUEUE";

/**
 * Dedicated connection factory for the SSE endpoint's Redis pub/sub subscriber. Each open
 * `/submissions/:id/stream` connection gets its own ioredis client here (a connection in
 * subscribe mode can't also run other commands), separate from the shared REDIS_CLIENT used for
 * ordinary commands (session storage, publishing) and separate from BullMQ's own internal
 * connection.
 */
export function createRedisConnection(): Redis {
  return new Redis(REDIS_URL);
}

export const redisClientProvider = {
  provide: REDIS_CLIENT,
  useFactory: (): Redis => new Redis(REDIS_URL),
};

export const judgeQueueProvider = {
  provide: JUDGE_QUEUE,
  // Pass a plain connection options object rather than constructing our own `Redis` instance
  // here: BullMQ bundles its own copy of ioredis, and a separately-installed ioredis copy (even
  // the "same" version) can resolve to a structurally distinct class under pnpm's strict
  // node_modules layout, which then fails BullMQ's ConnectionOptions type/behavior checks.
  // Letting BullMQ build its client internally sidesteps that (matches apps/judge's approach).
  useFactory: (): Queue => new Queue(JUDGE_QUEUE_NAME, { connection: { url: REDIS_URL, maxRetriesPerRequest: null } }),
};
