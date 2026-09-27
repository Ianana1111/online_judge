import { Redis } from "ioredis";
import { recordExecution } from "./metrics.js";
// Must be the very first import — see instrument.ts's own comment.
import "./instrument.js";
import { Queue, Worker, type Job } from "bullmq";
import * as Sentry from "@sentry/node";
import { prisma } from "@oj/db";
import {
  JUDGE_LOCAL_QUEUE_NAME,
  JUDGE_REMOTE_QUEUE_NAME,
  TEST_RUN_QUEUE_NAME,
  MAX_QUEUE_WAIT_MS, finishRun, runKey,
  type JudgeJobData,
  type TestRunJobData,
} from "@oj/shared";
import { judgeViaUva } from "./remote/uva.js";
import { judgeLocally } from "./local/judge.js";
import { runTestCases } from "./local/testRun.js";
import { reportResult, reportTestRunResult } from "./reportResult.js";
import { recordJudgeCompleted, startHealthServer } from "./health.js";
import { drainSandboxPool } from "./local/sandboxPool.js";
import { configureRemoteQueue } from "./remote/queue-policy.js";
import { configureSandboxCapacity } from "./local/sandboxCapacity.js";
import { configureLocalQueue } from "./queue-policy.js";
import { streamTestCases } from "./local/testData.js";
import { judgeRuntimeConfig } from "./runtime-config.js";

const runtime = judgeRuntimeConfig();
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
// Per-process workers are also constrained by Redis global queue limits.
const LOCAL_CONCURRENCY = runtime.localConcurrency;
// Default 1: every submission proxies through a single shared UVa bot account, and we identify our
// verdict row by "smallest new submission id" (see remote/uva.ts) — which is only unambiguous if
// submissions go out strictly one at a time. Parallel submits through one account would also raise
// rate-limit/ban risk on a community-run judge for no real throughput gain.
const REMOTE_CONCURRENCY = 1;
// The "Run" feature has no such constraint — each run gets its own disposable sandbox and never
// touches UVa — so it can afford more headroom to stay snappy under concurrent site usage.
const TEST_RUN_CONCURRENCY = runtime.testRunConcurrency;

// Pass a plain options object rather than constructing our own `Redis` instance: bullmq bundles
// its own ioredis internally, and a separately-installed ioredis copy (even the "same" version
// range) can resolve to a structurally distinct class in a pnpm store, which then fails
// `Worker`'s ConnectionOptions type check. Letting BullMQ build the client itself sidesteps that.
const connection = { url: REDIS_URL, maxRetriesPerRequest: null };
const remoteQueue = new Queue(JUDGE_REMOTE_QUEUE_NAME, { connection });
await configureRemoteQueue(remoteQueue);
await remoteQueue.close();
const localQueue = new Queue(JUDGE_LOCAL_QUEUE_NAME, { connection });
const runQueue = new Queue(TEST_RUN_QUEUE_NAME, { connection });
await configureLocalQueue(localQueue, LOCAL_CONCURRENCY);
await configureLocalQueue(runQueue, TEST_RUN_CONCURRENCY);
const resultRedis = new Redis(REDIS_URL, { maxRetriesPerRequest: 1, commandTimeout: 3000 });
resultRedis.on("error", () => console.error("Judge state Redis unavailable"));
configureSandboxCapacity(resultRedis);

// Which queue a submission landed in was already decided at enqueue time (see
// submissions.service.ts, keyed off whether the problem has TestCase rows) — these two processors
// just judge it the way that queue promises: judgeLocally in a Vercel Sandbox microVM, or
// judgeViaUva against the real UVa Online Judge (apps/judge/src/remote/README.md). A defensive
// re-check still runs here too (judgeLocally itself returns SE if testCases turns out empty) in
// case test data was deleted between submit and judge.
async function processLocalJob(job: Job<JudgeJobData>): Promise<void> {
  const { submissionId, evaluationVersion = 1 } = job.data;
  const claim = await prisma.submission.updateMany({ where: { id: submissionId, evaluationVersion, verdict: { in: ["PENDING", "JUDGING"] } }, data: { verdict: "JUDGING", status: "JUDGING" } });
  if (!claim.count) return;

  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
    include: { problem: true },
  });

  // Interim status so the live SSE stream shows "Judging..." while we wait on the verdict, rather
  // than sitting at PENDING for the whole judge duration.
  await reportResult({ submissionId, evaluationVersion, status: "JUDGING" }).catch(() => {});

  const { problem } = submission;
  const outcome = await judgeLocally(problem, await streamTestCases(problem.id), submission.languageKey, submission.sourceCode);

  await reportResult({ submissionId, evaluationVersion, judgedOn: "SELF", ...outcome });
  await recordExecution(resultRedis, "submit", job.timestamp, job.processedOn ?? Date.now(), outcome.status === "SE");
}

async function processRemoteJob(job: Job<JudgeJobData>): Promise<void> {
  const { submissionId, evaluationVersion = 1 } = job.data;
  const claim = await prisma.submission.updateMany({ where: { id: submissionId, evaluationVersion, verdict: { in: ["PENDING", "JUDGING"] } }, data: { verdict: "JUDGING", status: "JUDGING" } });
  if (!claim.count) return;

  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
    include: { problem: true },
  });

  await reportResult({ submissionId, evaluationVersion, status: "JUDGING" }).catch(() => {});

  const outcome = await judgeViaUva(submission.problem, submission.languageKey, submission.sourceCode);

  await reportResult({ submissionId, evaluationVersion, judgedOn: "REMOTE", ...outcome });
}

function makeJudgeFailureHandler(processFn: (job: Job<JudgeJobData>) => Promise<void>) {
  return async (job: Job<JudgeJobData>) => {
    try {
      const saved = await prisma.submission.findUnique({ where: { id: job.data.submissionId }, select: { pendingJudgeResult: true, evaluationVersion: true } });
      if (saved?.pendingJudgeResult && saved.evaluationVersion === (job.data.evaluationVersion ?? 1)) {
        await reportResult(saved.pendingJudgeResult as unknown as Parameters<typeof reportResult>[0]);
        return;
      }
      if (!job.processedOn || job.attemptsMade === 0) {
        if (Date.now() - job.timestamp > MAX_QUEUE_WAIT_MS) {
          await reportResult({ ...job.data, status: "SE", compileError: "The queue wait limit was reached. Your submission allowance has been restored. Please try again." });
          return;
        }
      }
      await processFn(job);
    } catch (err) {
      console.error(`Job ${job.id} (submission ${job.data.submissionId}) failed; see sanitized error telemetry`);
      if (job.attemptsMade + 1 >= (job.opts.attempts ?? 1)) await reportResult({
        submissionId: job.data.submissionId,
        evaluationVersion: job.data.evaluationVersion ?? 1,
        status: "SE",
        compileError: "The judging service could not complete this submission. Please try again.",
      }).catch(() => {
        console.error("Additionally failed to report SE result");
      });
      throw err;
    }
  };
}

const localWorker = new Worker<JudgeJobData>(JUDGE_LOCAL_QUEUE_NAME, makeJudgeFailureHandler(processLocalJob), {
  connection,
  concurrency: LOCAL_CONCURRENCY,
  lockDuration: 120_000,
});
const remoteWorker = new Worker<JudgeJobData>(JUDGE_REMOTE_QUEUE_NAME, makeJudgeFailureHandler(processRemoteJob), {
  connection,
  concurrency: REMOTE_CONCURRENCY,
  lockDuration: 120_000,
});

for (const w of [localWorker, remoteWorker]) {
  w.on("completed", (job) => {
    recordJudgeCompleted();
    console.log(`Judged submission ${job.data.submissionId}`);
  });
  w.on("failed", (job, err) => {
    console.error(`Judge failed for job ${job?.id}; see sanitized error telemetry`);
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
  const saved = await resultRedis.get(runKey(runId, "result"));
  if (saved && JSON.parse(saved).status !== "RUNNING") return;
  if (!await resultRedis.exists(runKey(runId, "owner"))) return;
  const outcome = Date.now() - job.timestamp > MAX_QUEUE_WAIT_MS
    ? { runId, status: "ERROR" as const, compileError: "The queue wait limit was reached. Your run allowance has been restored. Please try again." }
    : await runTestCases(runId, problemId, languageKey, sourceCode, cases);
  await finishRun(resultRedis, outcome);
  await recordExecution(resultRedis, "run", job.timestamp, job.processedOn ?? Date.now(), outcome.status === "ERROR");
  // Direct Redis persistence is authoritative; an HTTP callback failure must not replace it.
  await reportTestRunResult(outcome).catch(() => {});
}

const testRunWorker = new Worker<TestRunJobData>(
  TEST_RUN_QUEUE_NAME,
  async (job) => {
    try {
      await processTestRunJob(job);
    } catch (err) {
      console.error(`Test-run job ${job.id} (run ${job.data.runId}) failed; see sanitized error telemetry`);
      if (job.attemptsMade + 1 >= (job.opts.attempts ?? 1)) await finishRun(resultRedis, {
        runId: job.data.runId,
        status: "ERROR",
        compileError: "The judging service could not complete this run. Please try again.",
      }).catch(() => {
        console.error("Additionally failed to report test-run error");
      });
      throw err;
    }
  },
  { connection, concurrency: TEST_RUN_CONCURRENCY, lockDuration: 120_000 },
);

testRunWorker.on("completed", (job) => console.log(`Ran test cases for run ${job.data.runId}`));
testRunWorker.on("failed", (job, err) => {
  console.error(`Test run failed for job ${job?.id}; see sanitized error telemetry`);
  Sentry.captureException(err, { tags: { runId: job?.data.runId } });
});

console.log(`Local judge worker started (concurrency=${LOCAL_CONCURRENCY}), listening on queue "${JUDGE_LOCAL_QUEUE_NAME}"`);
console.log(`Remote judge worker started (concurrency=${REMOTE_CONCURRENCY}), listening on queue "${JUDGE_REMOTE_QUEUE_NAME}"`);
console.log(`Test-run worker started (concurrency=${TEST_RUN_CONCURRENCY}), listening on queue "${TEST_RUN_QUEUE_NAME}"`);
startHealthServer();
const heartbeat = async () => {
  await resultRedis.set("oj:judge:heartbeat", JSON.stringify({ at: Date.now(), rssMb: Math.round(process.memoryUsage().rss / 1048576), localConcurrency: LOCAL_CONCURRENCY, runConcurrency: TEST_RUN_CONCURRENCY }), "EX", 45);
};
await heartbeat();
const heartbeatTimer = setInterval(() => void heartbeat().catch(() => {}), 10_000);
heartbeatTimer.unref();
for (const worker of [localWorker, remoteWorker, testRunWorker]) {
  worker.on("error", (error) => { console.error("Judge queue connection error; see sanitized telemetry"); Sentry.captureException(error); });
}

async function shutdown() {
  console.log("Shutting down judge worker...");
  clearInterval(heartbeatTimer);
  // Stop any standby sandboxes before disconnecting — a deliberate restart/deploy shouldn't leave
  // pooled sandboxes running any longer than necessary (see sandboxPool.ts's own comment; Vercel's
  // own per-member timeout is only the last-resort safety net, not the intended cleanup path).
  await drainSandboxPool().catch(() => {});
  await Promise.all([localWorker.close(), remoteWorker.close(), testRunWorker.close()]);
  await Promise.all([localQueue.close(), runQueue.close(), resultRedis.quit()]);
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
