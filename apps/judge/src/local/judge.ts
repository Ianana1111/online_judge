import type { Sandbox } from "@vercel/sandbox";
import type { Problem, TestCase } from "@oj/db";
import type { Verdict } from "@oj/shared";
import { LANGUAGES } from "./languages.js";
import { checkOutput } from "./checkers.js";
import { OUTPUT_CAP_BYTES, compileInSandbox, createJudgeSandbox, runOneCase } from "./sandboxRun.js";
import type { JudgeOutcome } from "../remote/uva.js";

/** Signal-exit heuristics for classifying a nonzero, non-timeout exit as MLE vs plain RE. `ulimit
 * -v` capping virtual memory doesn't produce a clean, distinguishable exit code across languages —
 * C++'s uncaught std::bad_alloc aborts (SIGABRT, 134), a hard OOM kill is SIGKILL (137), and
 * Python's MemoryError just looks like any other unhandled exception (exit 1) — so stderr text is
 * the only reliable signal for that last case. */
function looksLikeMle(exitCode: number, stderr: string): boolean {
  if (exitCode === 137 || exitCode === 134) return true;
  return /bad_alloc|cannot allocate memory|memoryerror|outofmemoryerror|std::length_error/i.test(stderr);
}

/**
 * Judges a submission entirely inside an ephemeral Vercel Sandbox microVM against this problem's
 * own TestCase rows — no UVa relay involved. See scripts/build-snapshot.ts for how
 * JUDGE_SANDBOX_SNAPSHOT_ID is produced (a snapshot with g++/javac/python3 already installed, so a
 * fresh sandbox boots straight into a ready judging environment instead of paying a dnf-install
 * cost on every submission).
 */
export async function judgeLocally(
  problem: Problem,
  testCases: TestCase[],
  languageKey: string,
  sourceCode: string,
): Promise<JudgeOutcome> {
  const snapshotId = process.env.JUDGE_SANDBOX_SNAPSHOT_ID;
  if (!snapshotId) {
    return { status: "SE" as Verdict, compileError: "Local judging is not configured (missing JUDGE_SANDBOX_SNAPSHOT_ID)." };
  }
  const lang = LANGUAGES[languageKey];
  if (!lang) {
    return { status: "SE" as Verdict, compileError: `Language "${languageKey}" has no local judge support.` };
  }
  if (testCases.length === 0) {
    return { status: "SE" as Verdict, compileError: "This problem has no local test cases configured." };
  }

  let sandbox: Sandbox | undefined;
  try {
    sandbox = await createJudgeSandbox(snapshotId, 90_000);

    const compiled = await compileInSandbox(sandbox, lang, sourceCode);
    if (!compiled.ok) {
      return { status: "CE" as Verdict, compileError: compiled.compileError };
    }

    const timeLimitMs = problem.timeLimitMs * lang.timeMultiplier;
    let maxTimeMs = 0;
    let maxMemoryKb: number | null = null;

    for (const tc of testCases) {
      const run = await runOneCase(
        sandbox,
        lang.runCmd({ memKb: problem.memoryLimitKb }),
        tc.input,
        timeLimitMs,
        problem.memoryLimitKb,
        lang.ulimitMemory,
      );

      maxTimeMs = Math.max(maxTimeMs, run.timeMs);
      if (run.memoryKb !== null) maxMemoryKb = Math.max(maxMemoryKb ?? 0, run.memoryKb);

      if (run.timedOut) {
        return { status: "TLE" as Verdict, timeMs: maxTimeMs, memoryKb: maxMemoryKb ?? undefined };
      }
      if (run.exitCode !== 0) {
        const status: Verdict = looksLikeMle(run.exitCode, run.stderr) ? "MLE" : "RE";
        return { status, timeMs: maxTimeMs, memoryKb: maxMemoryKb ?? undefined };
      }
      if (Buffer.byteLength(run.stdout) >= OUTPUT_CAP_BYTES) {
        return { status: "OLE" as Verdict, timeMs: maxTimeMs, memoryKb: maxMemoryKb ?? undefined };
      }

      const passed = checkOutput(problem.checkerType, tc.output, run.stdout, problem.floatEps);
      if (!passed) {
        return { status: "WA" as Verdict, timeMs: maxTimeMs, memoryKb: maxMemoryKb ?? undefined };
      }
    }

    return { status: "AC" as Verdict, timeMs: maxTimeMs, memoryKb: maxMemoryKb ?? undefined, score: 100 };
  } catch (err) {
    return {
      status: "SE" as Verdict,
      compileError: `Local judge error: ${err instanceof Error ? err.message : String(err)}`,
    };
  } finally {
    if (sandbox) await sandbox.stop().catch(() => {});
  }
}
