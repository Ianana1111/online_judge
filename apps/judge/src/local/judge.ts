import type { Sandbox } from "@vercel/sandbox";
import type { Problem, TestCase } from "@oj/db";
import type { Verdict } from "@oj/shared";
import { LANGUAGES } from "./languages.js";
import { evaluateInSandbox } from "./evaluate.js";
import { createJudgeSandbox, logSandboxApiError } from "./sandboxRun.js";
import { notePoolActivity, tryClaimPooledSandbox } from "./sandboxPool.js";
import type { JudgeOutcome } from "../remote/uva.js";

const JUDGE_SANDBOX_TIMEOUT_MS = 90_000;

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
  let fromPool = false;
  const caseTimings: number[] = [];

  // Notify the pool regardless of whether we end up claiming from it — this is what keeps a spare
  // ready for whichever job comes *next*; it must never delay this one (see notePoolActivity's own
  // contract — fire-and-forget, no await).
  notePoolActivity(snapshotId);

  let sandbox: Sandbox | undefined;
  try {
    sandbox = (await tryClaimPooledSandbox(JUDGE_SANDBOX_TIMEOUT_MS)) ?? undefined;
    fromPool = !!sandbox;
    if (!sandbox) sandbox = await createJudgeSandbox(snapshotId, JUDGE_SANDBOX_TIMEOUT_MS);
    tAfterCreate = Date.now();

    return await evaluateInSandbox(sandbox, problem, testCases, languageKey, sourceCode, {
      compiled: () => { tAfterCompile = Date.now(); },
      caseFinished: (_ord, wallMs) => { caseTimings.push(wallMs); },
    });
  } catch (err) {
    logSandboxApiError(`judgeLocally problem=${problem.uvaId ?? problem.id}`, err);
    return {
      status: "SE" as Verdict,
      compileError: `Local judge error: ${err instanceof Error ? err.message : String(err)}`,
    };
  } finally {
    // The verdict above is already fully decided by this point — stopping the sandbox is pure
    // cleanup with zero bearing on it, so the caller (and the person waiting on their result) must
    // never be made to wait for it. Measured in production: this single `await` was routinely
    // 6-7 SECONDS — dwarfing boot + compile + every test case *combined* — making it the actual
    // dominant cost behind "judging feels slow," not sandbox creation as originally suspected.
    // Fired in the background instead and logged separately once it actually finishes (purely for
    // visibility); the sandbox's own bounded timeout is what guarantees it's cleaned up eventually
    // even in the worst case where this call never resolves at all.
    const tDone = Date.now();
    if (sandbox) {
      const s = sandbox;
      void s
        .stop()
        .catch((err) => console.error(`[judgeLocally] background sandbox.stop failed:`, err))
        .finally(() => console.log(`[judgeLocally] problem=${problem.uvaId ?? problem.id} backgroundStopMs=${Date.now() - tDone}`));
    }
    console.log(
      `[judgeLocally] problem=${problem.uvaId ?? problem.id} lang=${languageKey} pool=${fromPool} totalMs=${tDone - t0} ` +
        `createMs=${tAfterCreate - t0} compileMs=${tAfterCompile - tAfterCreate} casesMs=[${caseTimings.join(",")}]`,
    );
  }
}
