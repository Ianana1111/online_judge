import type { Queue } from "bullmq";
/** Redis enforces this across every replica, including rolling deployments. */
export async function configureRemoteQueue(queue: Queue) {
  await queue.setGlobalConcurrency(1);
  await queue.setGlobalRateLimit(1, 8000);
}
