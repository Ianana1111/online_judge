import type { Sandbox } from "@vercel/sandbox";
import { prisma } from "@oj/db";
import type { RunCaseResultDto, TestRunResultDto } from "@oj/shared";
import { LANGUAGES } from "./languages.js";
import { compileInSandbox, createJudgeSandbox, runOneCase } from "./sandboxRun.js";

// Shorter than the real judge's 90s (judge.ts) — a "Run" is a handful of small sample/custom
// cases for eyeballing output, not a stress-test suite, and this feature has no per-user quota
// (see RunsService's cooldown), so sandbox spin-up cost needs to stay bounded.
const RUN_SANDBOX_TIMEOUT_MS = 30_000;
const STDOUT_CAP_CHARS = 100_000; // plenty for a sample/custom test's output; guards the Redis
// cache + SSE payload against a runaway print loop the user is actively debugging.

/**
 * Compiles `sourceCode` once and runs it against every given case, returning raw stdout/stderr
 * per case — no checker, no verdict, nothing persisted. This is deliberately independent of
 * `judgeLocally` (judge.ts): it works for every problem (any problem has Samples), not just the
 * subset with local TestCase rows, since there's no hidden expected output to check against here.
 */
export async function runTestCases(
  runId: string,
  problemId: string,
  languageKey: string,
  sourceCode: string,
  cases: { id: string; input: string }[],
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
    select: { timeLimitMs: true, memoryLimitKb: true },
  });
  if (!problem) {
    return { runId, status: "ERROR", compileError: "Problem not found." };
  }

  // Same coarse phase timing as judgeLocally (judge.ts) — see that function's own comment.
  const t0 = Date.now();
  let tAfterCreate = t0;
  let tAfterCompile = t0;
  const caseTimings: number[] = [];

  let sandbox: Sandbox | undefined;
  try {
    sandbox = await createJudgeSandbox(snapshotId, RUN_SANDBOX_TIMEOUT_MS);
    tAfterCreate = Date.now();

    const compiled = await compileInSandbox(sandbox, lang, sourceCode);
    tAfterCompile = Date.now();
    if (!compiled.ok) {
      return { runId, status: "COMPILE_ERROR", compileError: compiled.compileError };
    }

    const timeLimitMs = problem.timeLimitMs * lang.timeMultiplier;
    const results: RunCaseResultDto[] = [];
    for (const c of cases) {
      const tCaseStart = Date.now();
      const run = await runOneCase(
        sandbox,
        lang.runCmd({ memKb: problem.memoryLimitKb }),
        c.input,
        timeLimitMs,
        problem.memoryLimitKb,
        lang.ulimitMemory,
      );
      caseTimings.push(Date.now() - tCaseStart);
      results.push({
        id: c.id,
        stdout: run.stdout.slice(0, STDOUT_CAP_CHARS),
        stderr: run.stderr.slice(0, 8000),
        timeMs: run.timeMs,
        timedOut: run.timedOut,
        exitCode: run.exitCode,
      });
    }

    return { runId, status: "DONE", cases: results };
  } catch (err) {
    return { runId, status: "ERROR", compileError: err instanceof Error ? err.message : String(err) };
  } finally {
    if (sandbox) await sandbox.stop().catch(() => {});
    console.log(
      `[runTestCases] problem=${problemId} lang=${languageKey} totalMs=${Date.now() - t0} ` +
        `createMs=${tAfterCreate - t0} compileMs=${tAfterCompile - tAfterCreate} casesMs=[${caseTimings.join(",")}]`,
    );
  }
}
