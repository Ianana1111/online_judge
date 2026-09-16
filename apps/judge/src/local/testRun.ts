import type { Sandbox } from "@vercel/sandbox";
import { prisma } from "@oj/db";
import type { RunCaseResultDto, TestRunResultDto, TestRunJobData } from "@oj/shared";
import { sampleRevision } from "@oj/shared";
import { LANGUAGES } from "./languages.js";
import { compileInSandbox, createJudgeSandbox, logSandboxApiError, runOneCase } from "./sandboxRun.js";
import { notePoolActivity, tryClaimPooledSandbox } from "./sandboxPool.js";
import { checkProblemOutput } from "./checkers.js";
import { runtimeVerdict } from "./runVerdict.js";

// Match Submit's sandbox lifetime, including compilation and per-language time multipliers.
const RUN_SANDBOX_TIMEOUT_MS = 90_000;
const STDOUT_CAP_CHARS = 100_000; // plenty for a sample/custom test's output; guards the Redis
// cache + SSE payload against a runaway print loop the user is actively debugging.

/**
 * Compiles `sourceCode` once and runs it against every given case, returning raw stdout/stderr
 * per case. Official samples use Submit's checker; custom inputs have no expected answer.
 * Sample results are never persisted as submission verdicts and do not imply hidden tests pass.
 */
export async function runTestCases(
  runId: string,
  problemId: string,
  languageKey: string,
  sourceCode: string,
  cases: TestRunJobData["cases"],
): Promise<TestRunResultDto> {
  const snapshotId = process.env.JUDGE_SANDBOX_SNAPSHOT_ID;
  if (!snapshotId) {
    return { runId, status: "ERROR", compileError: "Running code is not configured on this deployment." };
  }
  const lang = LANGUAGES[languageKey];
  if (!lang) {
    return { runId, status: "ERROR", compileError: `Language "${languageKey}" isn't supported for running code.` };
  }
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: { visibility: true, timeLimitMs: true, memoryLimitKb: true, checkerType: true, floatEps: true, uvaId: true, slug: true, samples: { select: { ord: true, input: true, output: true } } },
  });
  if (!problem?.visibility) {
    return { runId, status: "ERROR", compileError: "Problem not found." };
  }

  // Same coarse phase timing as judgeLocally (judge.ts) — see that function's own comment.
  const t0 = Date.now();
  let tAfterCreate = t0;
  let tAfterCompile = t0;
  let fromPool = false;
  const caseTimings: number[] = [];

  // Shares the same standby pool as real submissions (judge.ts) — someone iterating on one
  // problem commonly alternates Run/Submit in quick succession, so either one keeps a spare ready
  // for the other. See notePoolActivity's own contract: fire-and-forget, never awaited here.
  notePoolActivity(snapshotId);

  let sandbox: Sandbox | undefined;
  try {
    sandbox = (await tryClaimPooledSandbox(RUN_SANDBOX_TIMEOUT_MS)) ?? undefined;
    fromPool = !!sandbox;
    if (!sandbox) sandbox = await createJudgeSandbox(snapshotId, RUN_SANDBOX_TIMEOUT_MS);
    tAfterCreate = Date.now();

    const compiled = await compileInSandbox(sandbox, lang, sourceCode);
    tAfterCompile = Date.now();
    if (!compiled.ok) {
      return { runId, status: "COMPILE_ERROR", compileError: compiled.compileError };
    }

    const timeLimitMs = problem.timeLimitMs * lang.timeMultiplier;
    const results: RunCaseResultDto[] = [];
    for (const c of cases) {
      const sample = c.sampleOrd === undefined ? undefined : problem.samples.find((s) => s.ord === c.sampleOrd);
      if ((c.sampleOrd !== undefined && !sample) || (!sample && c.input === undefined) || (sample && c.input !== undefined && c.input !== sample.input) || (sample && c.sampleRevision !== undefined && c.sampleRevision !== await sampleRevision(sample.input, sample.output))) {
        return { runId, status: "ERROR", compileError: "Sample has changed. Reload the problem and run again." };
      }
      const input = sample?.input ?? c.input!;
      const tCaseStart = Date.now();
      const run = await runOneCase(
        sandbox,
        lang.runCmd({ memKb: problem.memoryLimitKb }),
        input,
        timeLimitMs,
        problem.memoryLimitKb,
        lang.ulimitMemory,
      );
      caseTimings.push(Date.now() - tCaseStart);
      const failure = runtimeVerdict(run, problem.memoryLimitKb);
      // Compare full stdout before truncating its display payload.
      const verdict = failure ?? (sample ? (checkProblemOutput(problem, input, sample.output, run.stdout) ? "AC" : "WA") : undefined);
      results.push({
        id: c.id,
        stdout: run.stdout.slice(0, STDOUT_CAP_CHARS),
        stderr: run.stderr.slice(0, 8000),
        timeMs: run.timeMs,
        timedOut: run.timedOut,
        exitCode: run.exitCode,
        verdict,
        outputTruncated: run.stdout.length > STDOUT_CAP_CHARS,
      });
    }

    return { runId, status: "DONE", cases: results };
  } catch (err) {
    logSandboxApiError(`runTestCases problem=${problemId}`, err);
    return { runId, status: "ERROR", compileError: "The judging service could not complete this run. Please try again." };
  } finally {
    // See judge.ts's identical fix for why this fires in the background instead of being awaited
    // — measured in production, this single call was routinely 6-7 seconds, dwarfing everything
    // else combined, for zero benefit to the person waiting on their output.
    const tDone = Date.now();
    if (sandbox) {
      const s = sandbox;
      void s
        .stop()
        .catch((err) => logSandboxApiError("runTestCases cleanup", err))
        .finally(() => console.log(`[runTestCases] problem=${problemId} backgroundStopMs=${Date.now() - tDone}`));
    }
    console.log(
      `[runTestCases] problem=${problemId} lang=${languageKey} pool=${fromPool} totalMs=${tDone - t0} ` +
        `createMs=${tAfterCreate - t0} compileMs=${tAfterCompile - tAfterCreate} casesMs=[${caseTimings.join(",")}]`,
    );
  }
}
