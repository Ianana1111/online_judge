// Must be the very first import — see instrument.ts's own comment.
import "./instrument.js";
import { Worker, type Job } from "bullmq";
import * as Sentry from "@sentry/node";
import { prisma } from "@oj/db";
import {
  JUDGE_LOCAL_QUEUE_NAME,
  JUDGE_REMOTE_QUEUE_NAME,
  TEST_RUN_QUEUE_NAME,
  type JudgeJobData,
  type TestRunJobData,
} from "@oj/shared";
import { judgeViaUva } from "./remote/uva.js";
import { judgeLocally } from "./local/judge.js";
import { runTestCases } from "./local/testRun.js";
import { reportResult, reportTestRunResult } from "./reportResult.js";
import { recordJudgeCompleted, startHealthServer } from "./health.js";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
// Local sandbox judging has no cross-submission shared state to serialize around — every
// submission gets its own disposable, isolated microVM — so this can run with real concurrency.
// The default (6) is a starting point, not a measured ceiling: raise it if Vercel Sandbox is
// comfortably keeping up and queue depth is the bottleneck; lower it if sandbox creation starts
// erroring under load (account-level concurrent-sandbox limits).
const LOCAL_CONCURRENCY = parseInt(process.env.JUDGE_LOCAL_CONCURRENCY ?? "6", 10);
// Default 1: every submission proxies through a single shared UVa bot account, and we identify our
// verdict row by "smallest new submission id" (see remote/uva.ts) — which is only unambiguous if
// submissions go out strictly one at a time. Parallel submits through one account would also raise
// rate-limit/ban risk on a community-run judge for no real throughput gain.
const REMOTE_CONCURRENCY = parseInt(process.env.JUDGE_CONCURRENCY ?? "1", 10);
// The "Run" feature has no such constraint — each run gets its own disposable sandbox and never
// touches UVa — so it can afford more headroom to stay snappy under concurrent site usage.
const TEST_RUN_CONCURRENCY = parseInt(process.env.TEST_RUN_CONCURRENCY ?? "3", 10);

// Pass a plain options object rather than constructing our own `Redis` instance: bullmq bundles
// its own ioredis internally, and a separately-installed ioredis copy (even the "same" version
// range) can resolve to a structurally distinct class in a pnpm store, which then fails
// `Worker`'s ConnectionOptions type check. Letting BullMQ build the client itself sidesteps that.
const connection = { url: REDIS_URL, maxRetriesPerRequest: null };

// Which queue a submission landed in was already decided at enqueue time (see
// submissions.service.ts, keyed off whether the problem has TestCase rows) — these two processors
// just judge it the way that queue promises: judgeLocally in a Vercel Sandbox microVM, or
// judgeViaUva against the real UVa Online Judge (apps/judge/src/remote/README.md). A defensive
// re-check still runs here too (judgeLocally itself returns SE if testCases turns out empty) in
// case test data was deleted between submit and judge.
async function processLocalJob(job: Job<JudgeJobData>): Promise<void> {
  const { submissionId } = job.data;

  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
    include: { problem: { include: { testCases: { orderBy: { ord: "asc" } } } } },
  });

  // Interim status so the live SSE stream shows "Judging..." while we wait on the verdict, rather
  // than sitting at PENDING for the whole judge duration.
  await reportResult({ submissionId, status: "JUDGING" }).catch(() => {});

  const { problem } = submission;
  const outcome = await judgeLocally(problem, problem.testCases, submission.languageKey, submission.sourceCode);

  await reportResult({ submissionId, judgedOn: "SELF", ...outcome });
}

async function processRemoteJob(job: Job<JudgeJobData>): Promise<void> {
  const { submissionId } = job.data;

  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
    include: { problem: true },
  });

  await reportResult({ submissionId, status: "JUDGING" }).catch(() => {});

  const outcome = await judgeViaUva(submission.problem, submission.languageKey, submission.sourceCode);

  await reportResult({ submissionId, judgedOn: "REMOTE", ...outcome });
}

function makeJudgeFailureHandler(processFn: (job: Job<JudgeJobData>) => Promise<void>) {
  return async (job: Job<JudgeJobData>) => {
    try {
      await processFn(job);
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
  };
}

const localWorker = new Worker<JudgeJobData>(JUDGE_LOCAL_QUEUE_NAME, makeJudgeFailureHandler(processLocalJob), {
  connection,
  concurrency: LOCAL_CONCURRENCY,
});
const remoteWorker = new Worker<JudgeJobData>(JUDGE_REMOTE_QUEUE_NAME, makeJudgeFailureHandler(processRemoteJob), {
  connection,
  concurrency: REMOTE_CONCURRENCY,
});

for (const w of [localWorker, remoteWorker]) {
  w.on("completed", (job) => {
    recordJudgeCompleted();
    console.log(`Judged submission ${job.data.submissionId}`);
  });
  w.on("failed", (job, err) => {
    console.error(`Judge failed for job ${job?.id}:`, err.message);
    // Not also captured in the inner catch above — that block re-throws, so this event always
    // fires for the same failure too; capturing in both places would double-report every failure.
    Sentry.captureException(err, { tags: { submissionId: job?.data.submissionId } });
  });
}

// "Run" jobs (apps/judge/src/local/testRun.ts) — compile+run against sample/custom input for the
// site's in-browser test feature. No Submission row, no verdict, nothing persisted; the result
// just gets POSTed back and cached in Redis (see RunsService).
async function processTestRunJob(job: Job<TestRunJobData>): Promise<void> {
  const { runId, problemId, languageKey, sourceCode, cases } = job.data;
  const outcome = await runTestCases(runId, problemId, languageKey, sourceCode, cases);
  await reportTestRunResult(outcome);
}

const testRunWorker = new Worker<TestRunJobData>(
  TEST_RUN_QUEUE_NAME,
  async (job) => {
    try {
      await processTestRunJob(job);
    } catch (err) {
      console.error(`Test-run job ${job.id} (run ${job.data.runId}) failed:`, err);
      await reportTestRunResult({
        runId: job.data.runId,
        status: "ERROR",
        compileError: err instanceof Error ? err.message : String(err),
      }).catch((reportErr) => {
        console.error("Additionally failed to report test-run error:", reportErr);
      });
      throw err;
    }
  },
  { connection, concurrency: TEST_RUN_CONCURRENCY },
);

testRunWorker.on("completed", (job) => console.log(`Ran test cases for run ${job.data.runId}`));
testRunWorker.on("failed", (job, err) => {
  console.error(`Test run failed for job ${job?.id}:`, err.message);
  Sentry.captureException(err, { tags: { runId: job?.data.runId } });
});

console.log(`Local judge worker started (concurrency=${LOCAL_CONCURRENCY}), listening on queue "${JUDGE_LOCAL_QUEUE_NAME}"`);
console.log(`Remote judge worker started (concurrency=${REMOTE_CONCURRENCY}), listening on queue "${JUDGE_REMOTE_QUEUE_NAME}"`);
console.log(`Test-run worker started (concurrency=${TEST_RUN_CONCURRENCY}), listening on queue "${TEST_RUN_QUEUE_NAME}"`);
startHealthServer();

async function shutdown() {
  console.log("Shutting down judge worker...");
  await Promise.all([localWorker.close(), remoteWorker.close(), testRunWorker.close()]);
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
