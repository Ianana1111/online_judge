import { createServer } from "node:http";
import { Queue } from "bullmq";
import { JUDGE_LOCAL_QUEUE_NAME, JUDGE_REMOTE_QUEUE_NAME, TEST_RUN_QUEUE_NAME } from "@oj/shared";
import { getPoolStatus } from "./local/sandboxPool.js";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const PORT = Number(process.env.JUDGE_HEALTH_PORT ?? 4100);
const connection = { url: REDIS_URL, maxRetriesPerRequest: null };

// Read-only introspection — never .add()'d to, so this can't affect what the worker in worker.ts
// actually processes. Before this existed there was no way to tell "judge worker is stuck" apart
// from "judge worker is idle because nothing was submitted" from outside the process at all — a
// plain Node worker with no HTTP surface gives Railway nothing to healthcheck and gives nobody a
// signal to notice a silent stall.
const judgeLocalQueue = new Queue(JUDGE_LOCAL_QUEUE_NAME, { connection });
const judgeRemoteQueue = new Queue(JUDGE_REMOTE_QUEUE_NAME, { connection });
const testRunQueue = new Queue(TEST_RUN_QUEUE_NAME, { connection });

let lastJudgeCompletedAt: number | null = null;

export function recordJudgeCompleted(): void {
  lastJudgeCompletedAt = Date.now();
}

/**
 * Deliberately always 200 with the raw metrics in the body, not a pass/fail healthcheck that
 * could trigger an automatic restart — "stuck" vs. "just idle because nothing was submitted"
 * isn't reliably distinguishable from queue depth + last-completion time alone, and a false
 * positive here would restart a judge worker that's actually mid-way through, e.g., a set of
 * unusually slow submissions. Report the numbers; let a human (or a real alerting rule once one
 * exists) decide what's actually wrong.
 */
export function startHealthServer(): void {
  const server = createServer((req, res) => {
    if (req.url !== "/health") {
      res.writeHead(404).end();
      return;
    }
    void Promise.all([judgeLocalQueue.getJobCounts(), judgeRemoteQueue.getJobCounts(), testRunQueue.getJobCounts()])
      .then(([localCounts, remoteCounts, testRunCounts]) => {
        const body = {
          ok: true,
          lastJudgeCompletedAt: lastJudgeCompletedAt ? new Date(lastJudgeCompletedAt).toISOString() : null,
          secondsSinceLastJudge: lastJudgeCompletedAt ? Math.round((Date.now() - lastJudgeCompletedAt) / 1000) : null,
          judgeLocalQueue: localCounts,
          judgeRemoteQueue: remoteCounts,
          testRunQueue: testRunCounts,
          sandboxPool: getPoolStatus(),
        };
        res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(body));
      })
      .catch((err) => {
        res.writeHead(500, { "Content-Type": "application/json" }).end(JSON.stringify({ ok: false, error: String(err) }));
      });
  });
  server.listen(PORT, () => {
    console.log(`[judge] health server listening on port ${PORT}`);
  });
}
