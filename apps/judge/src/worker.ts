import { Worker, type Job } from "bullmq";
import { prisma } from "@oj/db";
import { JUDGE_QUEUE_NAME, type JudgeJobData } from "@oj/shared";
import { judgeViaUva } from "./remote/uva.js";
import { judgeLocally } from "./local/judge.js";
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

// A problem judges locally (apps/judge/src/local/judge.ts, a Vercel Sandbox microVM) the moment
// it has at least one TestCase row, and relays to the real UVa Online Judge otherwise
// (apps/judge/src/remote/README.md). Deliberately keyed off the data rather than a separate
// "judgeMode" flag on Problem — a flag could drift out of sync with whether test cases actually
// exist; this can't. Concurrency here just bounds how many submissions are mid-flight at once;
// judgeViaUva throttles its own requests to onlinejudge.org, judgeLocally has no such constraint
// (each submission gets its own disposable sandbox).
async function processJob(job: Job<JudgeJobData>): Promise<void> {
  const { submissionId } = job.data;

  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
    include: { problem: { include: { testCases: { orderBy: { ord: "asc" } } } } },
  });

  // Interim status so the live SSE stream shows "Judging..." while we wait on the verdict, rather
  // than sitting at PENDING for the whole judge duration.
  await reportResult({ submissionId, status: "JUDGING" }).catch(() => {});

  const { problem } = submission;
  const outcome =
    problem.testCases.length > 0
      ? await judgeLocally(problem, problem.testCases, submission.languageKey, submission.sourceCode)
      : await judgeViaUva(problem, submission.languageKey, submission.sourceCode);

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
