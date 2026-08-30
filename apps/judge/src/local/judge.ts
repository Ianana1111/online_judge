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

  // Coarse phase timing, logged once at the end — the launch audit flagged that there was no way
  // to tell "sandbox boot" from "compile" from "running N test cases" apart from a single opaque
  // end-to-end duration. Cheap (a handful of Date.now() calls) and directly answers "did the
  // round-trip-folding change in sandboxRun.ts actually help, and where does the rest of the time
  // go" without needing to reproduce a slow submission under a debugger.
  const t0 = Date.now();
  let tAfterCreate = t0;
  let tAfterCompile = t0;
  const caseTimings: number[] = [];

  let sandbox: Sandbox | undefined;
  try {
    sandbox = await createJudgeSandbox(snapshotId, 90_000);
    tAfterCreate = Date.now();

    const compiled = await compileInSandbox(sandbox, lang, sourceCode);
    tAfterCompile = Date.now();
    if (!compiled.ok) {
      return { status: "CE" as Verdict, compileError: compiled.compileError };
    }

    const timeLimitMs = problem.timeLimitMs * lang.timeMultiplier;
    let maxTimeMs = 0;
    let maxMemoryKb: number | null = null;

    // Deliberate: one sandbox is reused across every test case of this submission, not a fresh
    // one per case. A submission could in principle write a file during case 1 and read it back
    // during case 2 to behave differently than a genuinely-correct solution would — the launch
    // audit flagged this as worth evaluating. Weighed against that: exploiting it requires the
    // submission's author to already control what's being tested for THEIR OWN submission (no
    // cross-user or cross-submission leakage — a fresh sandbox is still used per submission), and
    // per-test-case sandbox creation would multiply Vercel Sandbox cold-start latency and cost by
    // the test case count on every single submission, worst when it matters least (exam-week
    // traffic spikes). Judged not worth that cost for the narrow, self-only risk it closes;
    // revisit if test data grows enough (see the audit's 3.1) that this stops being self-only.
    for (const tc of testCases) {
      const tCaseStart = Date.now();
      const run = await runOneCase(
        sandbox,
        lang.runCmd({ memKb: problem.memoryLimitKb }),
        tc.input,
        timeLimitMs,
        problem.memoryLimitKb,
        lang.ulimitMemory,
      );
      caseTimings.push(Date.now() - tCaseStart);

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
    const tStop = Date.now();
    console.log(
      `[judgeLocally] problem=${problem.uvaId ?? problem.id} lang=${languageKey} totalMs=${tStop - t0} ` +
        `createMs=${tAfterCreate - t0} compileMs=${tAfterCompile - tAfterCreate} ` +
        `casesMs=[${caseTimings.join(",")}] stopMs=${tStop - (caseTimings.length ? tAfterCompile + caseTimings.reduce((a, b) => a + b, 0) : tAfterCompile)}`,
    );
  }
}
