import type { Queue } from "bullmq";

/** These Redis settings apply across replicas and rolling deployments. */
export async function configureLocalQueue(queue: Queue, concurrency: number) {
  await queue.setGlobalConcurrency(concurrency);
  await queue.setGlobalRateLimit(20, 1000);
}
