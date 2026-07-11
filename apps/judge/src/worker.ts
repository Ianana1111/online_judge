import { Worker, type Job } from "bullmq";
import { prisma } from "@oj/db";
import { JUDGE_QUEUE_NAME, type JudgeJobData } from "@oj/shared";
import { judgeViaUva } from "./remote/uva.js";
import { reportResult } from "./reportResult.js";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
// Default 1: every submission proxies through a single shared UVa bot account, and we identify our
// verdict row by "smallest new submission id" (see remote/uva.ts) — which is only unambiguous if
// submissions go out strictly one at a time. Parallel submits through one account would also raise
// rate-limit/ban risk on a community-run judge for no real throughput gain.
const CONCURRENCY = parseInt(process.env.JUDGE_CONCURRENCY ?? "1", 10);

// Pass a plain options object rather than constructing our own `Redis` instance: bullmq bundles
// its own ioredis internally, and a separately-installed ioredis copy (even the "same" version
// range) can resolve to a structurally distinct class in a pnpm store, which then fails
// `Worker`'s ConnectionOptions type check. Letting BullMQ build the client itself sidesteps that.
const connection = { url: REDIS_URL, maxRetriesPerRequest: null };

// Every submission is judged by proxying to the real UVa Online Judge — there is no local
// sandbox anymore (see apps/judge/src/remote/README.md for how that adapter works and its
// caveats). Concurrency here just bounds how many submissions are mid-flight through the UVa
// adapter at once; judgeViaUva itself throttles actual requests to onlinejudge.org.
async function processJob(job: Job<JudgeJobData>): Promise<void> {
  const { submissionId } = job.data;

  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
    include: { problem: true },
  });

  // Interim status so the live SSE stream shows "Judging..." while we wait on UVa, rather than
  // sitting at PENDING for the whole login+submit+poll duration.
  await reportResult({ submissionId, status: "JUDGING" }).catch(() => {});

  const outcome = await judgeViaUva(submission.problem, submission.languageKey, submission.sourceCode);
  await reportResult({ submissionId, ...outcome });
}

const worker = new Worker<JudgeJobData>(
  JUDGE_QUEUE_NAME,
  async (job) => {
    try {
      await processJob(job);
    } catch (err) {
      console.error(`Job ${job.id} (submission ${job.data.submissionId}) failed:`, err);
      await reportResult({
        submissionId: job.data.submissionId,
        status: "SE",
        compileError: err instanceof Error ? err.message : String(err),
      }).catch((reportErr) => {
        console.error("Additionally failed to report SE result:", reportErr);
      });
      throw err;
    }
  },
  { connection, concurrency: CONCURRENCY },
);

worker.on("completed", (job) => console.log(`Judged submission ${job.data.submissionId}`));
worker.on("failed", (job, err) => console.error(`Judge failed for job ${job?.id}:`, err.message));

console.log(`Judge worker started (concurrency=${CONCURRENCY}), listening on queue "${JUDGE_QUEUE_NAME}"`);

async function shutdown() {
  console.log("Shutting down judge worker...");
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
