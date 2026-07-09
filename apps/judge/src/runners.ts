import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getLanguage, TestDataStore, type Verdict } from "@oj/shared";
import type { Problem, TestCase } from "@oj/db";
import { isolateInit, isolateCleanup, isolateRun, writeBoxFile, type BoxIdPool } from "./isolate.js";
import { compareOutput } from "./comparators.js";

const OUTPUT_CAP_BYTES = 64 * 1024 * 1024; // 64MB OLE cap
const COMPILE_MEM_KB = 512 * 1024;
const COMPILE_PROCESSES = 32;
const RUN_FSIZE_KB = 65536;

export interface TestVerdict {
  testOrd: number;
  verdict: Verdict;
  timeMs: number;
  memoryKb: number;
  points: number;
}

export interface JudgeOutcome {
  status: Verdict;
  timeMs?: number;
  memoryKb?: number;
  score?: number;
  compileError?: string;
  testResults?: TestVerdict[];
}

/**
 * `isolate`'s cgroup memory accounting kills a process at the limit (SG w/ OOM) rather than
 * reporting an over-budget max-rss, so `max-rss` at/near the box's --cg-mem is our MLE signal.
 */
function looksLikeOom(maxRssKb: number | undefined, memLimitKb: number): boolean {
  if (maxRssKb === undefined) return false;
  return maxRssKb >= memLimitKb * 0.95;
}

export async function judgeSubmission(
  boxIdPool: BoxIdPool,
  problem: Problem,
  testCases: TestCase[],
  languageKey: string,
  sourceCode: string,
  store: TestDataStore,
): Promise<JudgeOutcome> {
  if (testCases.length === 0) {
    // e.g. a scraped CPE/UVa problem whose test data is no longer hosted at the source —
    // without this guard the loop below never runs and `overall` stays at its "AC" default,
    // silently marking every submission Accepted with score 0.
    return { status: "SE", compileError: "No test data available for this problem." };
  }

  const language = getLanguage(languageKey);
  const boxId = await boxIdPool.acquire();

  try {
    const boxPath = await isolateInit(boxId);
    await writeBoxFile(boxPath, language.srcName, sourceCode);

    // --- Compile step ---
    // isolate's --stdin/--stdout/--stderr paths are resolved relative to the box directory
    // (the sandboxed process is chrooted into it) — NOT arbitrary host paths. Only --meta is
    // exempt (isolate itself, unchrooted, writes that after the child exits). So these must be
    // plain relative filenames, written/read on the host via boxPath (the same directory, seen
    // as `/box` from inside the sandbox).
    if (language.compileCmd) {
      const stdoutRel = "compile.out";
      const stderrRel = "compile.err";
      const { meta, exitCode } = await isolateRun({
        boxId,
        cmd: language.compileCmd,
        stdoutPath: stdoutRel,
        stderrPath: stderrRel,
        timeSec: Math.ceil(language.compileTimeMs / 1000),
        wallTimeSec: Math.ceil((language.compileTimeMs / 1000) * 2),
        memKb: COMPILE_MEM_KB,
        fsizeKb: RUN_FSIZE_KB,
        processes: COMPILE_PROCESSES,
      });
      // Rely on the meta file (isolate's documented result channel), not the wrapper's own
      // process exit code, which isn't a reliable success/failure signal across isolate versions.
      void exitCode;
      const compileFailed = meta.status !== undefined || (meta.exitcode !== undefined && meta.exitcode !== 0);
      if (compileFailed) {
        const stderr = await safeRead(join(boxPath, stderrRel));
        const stdout = await safeRead(join(boxPath, stdoutRel));
        return {
          status: "CE",
          compileError: (stderr || stdout || meta.message || "compilation failed").slice(0, 8000),
        };
      }
    }

    // --- Run against each test case, short-circuit on first non-AC ---
    const testResults: TestVerdict[] = [];
    let overall: Verdict = "AC";
    let maxTimeMs = 0;
    let maxMemKb = 0;
    const memLimitKb = problem.memoryLimitKb + language.memOverheadKb;
    const timeSec = (problem.timeLimitMs / 1000) * language.timeFactor;

    for (const tc of testCases) {
      const input = await store.getText(tc.inputKey);
      const expected = await store.getText(tc.answerKey);

      const inputRel = `${tc.ord}.in`;
      const stdoutRel = `${tc.ord}.out`;
      const stderrRel = `${tc.ord}.err`;
      await writeBoxFile(boxPath, inputRel, input);

      const runCmd = language.runCmd.map((part) =>
        part.replace("{memLimitMb}", String(Math.floor(problem.memoryLimitKb / 1024))),
      );

      const { meta } = await isolateRun({
        boxId,
        cmd: runCmd,
        stdinPath: inputRel,
        stdoutPath: stdoutRel,
        stderrPath: stderrRel,
        timeSec,
        wallTimeSec: timeSec * 2,
        memKb: memLimitKb,
        fsizeKb: RUN_FSIZE_KB,
        processes: language.sandboxProcessLimit,
      });

      const timeMs = Math.round((meta.time ?? meta["time-wall"] ?? 0) * 1000);
      const memoryKb = meta["max-rss"] ?? 0;
      maxTimeMs = Math.max(maxTimeMs, timeMs);
      maxMemKb = Math.max(maxMemKb, memoryKb);

      let verdict: Verdict;
      if (meta.status === "TO") {
        verdict = "TLE";
      } else if (meta.status === "SG") {
        verdict = looksLikeOom(memoryKb, memLimitKb) ? "MLE" : "RE";
      } else if (meta.status === "RE") {
        verdict = "RE";
      } else if (meta.status === "XX") {
        verdict = "SE";
      } else {
        const actual = await safeRead(join(boxPath, stdoutRel), OUTPUT_CAP_BYTES);
        if (actual === null) {
          verdict = "OLE";
        } else {
          const outcome = compareOutput(problem.checkerType, expected, actual, problem.floatEps ?? null);
          verdict = outcome;
        }
      }

      testResults.push({
        testOrd: tc.ord,
        verdict,
        timeMs,
        memoryKb,
        points: verdict === "AC" ? tc.points || 1 : 0,
      });

      if (verdict !== "AC") {
        overall = verdict;
        break;
      }
    }

    const passed = testResults.filter((t) => t.verdict === "AC").length;
    const score = testCases.length > 0 ? (passed / testCases.length) * 100 : 0;

    return {
      status: overall,
      timeMs: maxTimeMs,
      memoryKb: maxMemKb,
      score,
      testResults,
    };
  } finally {
    await isolateCleanup(boxId); // also removes the box directory itself, host and sandbox side
    boxIdPool.release(boxId);
  }
}

async function safeRead(path: string, capBytes?: number): Promise<string | null> {
  try {
    const buf = await readFile(path);
    if (capBytes !== undefined && buf.byteLength > capBytes) return null;
    return buf.toString("utf-8");
  } catch {
    return "";
  }
}
