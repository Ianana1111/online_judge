/**
 * One-time, phase B (Redis only): reads the submission ids written by
 * rejudge-affected-submissions.ts and pushes a fresh BullMQ job for each so the judge worker
 * re-judges them with the corrected uvaPid.
 */
import { readFileSync } from "node:fs";
import { Queue } from "bullmq";
import { JUDGE_QUEUE_NAME } from "@oj/shared";

async function main() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) throw new Error("REDIS_URL not set");

  const ids = JSON.parse(readFileSync("/tmp/rejudge-ids.json", "utf8")) as string[];
  console.log(`Enqueuing ${ids.length} submissions.`);

  const queue = new Queue(JUDGE_QUEUE_NAME, { connection: { url: redisUrl } });
  for (const id of ids) {
    await queue.add(JUDGE_QUEUE_NAME, { submissionId: id });
    console.log(`Enqueued ${id}`);
  }
  await queue.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
