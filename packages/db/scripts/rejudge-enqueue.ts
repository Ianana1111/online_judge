/**
 * One-time, phase B (Redis only): reads the submission ids written by
 * rejudge-affected-submissions.ts and pushes a fresh BullMQ job for each so the judge worker
 * re-judges them with the corrected uvaPid.
 */
import { readFileSync } from "node:fs";
import { Queue } from "bullmq";
import { prisma } from "@oj/db";
import { JUDGE_LOCAL_QUEUE_NAME, JUDGE_REMOTE_QUEUE_NAME } from "@oj/shared";

async function main() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) throw new Error("REDIS_URL not set");

  const ids = JSON.parse(readFileSync("/tmp/rejudge-ids.json", "utf8")) as string[];
  console.log(`Enqueuing ${ids.length} submissions.`);

  const localQueue = new Queue(JUDGE_LOCAL_QUEUE_NAME, { connection: { url: redisUrl } });
  const remoteQueue = new Queue(JUDGE_REMOTE_QUEUE_NAME, { connection: { url: redisUrl } });
  for (const id of ids) {
    const submission = await prisma.submission.findUniqueOrThrow({
      where: { id },
      include: { problem: { include: { _count: { select: { testCases: true } } } } },
    });
    const judgedLocally = submission.problem._count.testCases > 0;
    const queue = judgedLocally ? localQueue : remoteQueue;
    const queueName = judgedLocally ? JUDGE_LOCAL_QUEUE_NAME : JUDGE_REMOTE_QUEUE_NAME;
    await queue.add(queueName, { submissionId: id });
    console.log(`Enqueued ${id} (${judgedLocally ? "local" : "remote"})`);
  }
  await Promise.all([localQueue.close(), remoteQueue.close()]);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
