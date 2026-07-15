import { Sandbox } from "@vercel/sandbox";
import type { Problem, TestCase } from "@oj/db";
import type { Verdict } from "@oj/shared";
import { LANGUAGES } from "./languages.js";
import { checkOutput } from "./checkers.js";
import type { JudgeOutcome } from "../remote/uva.js";

const COMPILE_TIMEOUT_SEC = 20;
const OUTPUT_CAP_BYTES = 8 * 1024 * 1024; // 8MB — well above any sane CP answer; guards against a
// runaway-output submission ballooning memory in this worker process while we read its output back.

const WORKDIR = "/vercel/sandbox";

interface RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  timeMs: number;
  memoryKb: number | null;
  timedOut: boolean;
}

/** Parses GNU `time -v` output for the two fields judging cares about. Missing on parse failure
 * (rather than throwing) — a malformed time.log should degrade to "unknown timing," not abort an
 * otherwise-valid verdict. */
function parseTimeLog(log: string): { cpuMs: number | null; memoryKb: number | null } {
  const userMatch = log.match(/User time \(seconds\):\s*([\d.]+)/);
  const sysMatch = log.match(/System time \(seconds\):\s*([\d.]+)/);
  const memMatch = log.match(/Maximum resident set size \(kbytes\):\s*(\d+)/);
  const cpuMs =
    userMatch && sysMatch ? Math.round((parseFloat(userMatch[1]) + parseFloat(sysMatch[1])) * 1000) : null;
  const memoryKb = memMatch ? parseInt(memMatch[1], 10) : null;
  return { cpuMs, memoryKb };
}

async function runOneCase(
  sandbox: Sandbox,
  runCmd: { cmd: string; args: string[] },
  input: string,
  timeLimitMs: number,
  memoryLimitKb: number,
  ulimitMemory: boolean,
): Promise<RunResult> {
  await sandbox.writeFiles([{ path: `${WORKDIR}/in.txt`, content: Buffer.from(input) }]);

  const timeLimitSec = Math.max(1, Math.ceil(timeLimitMs / 1000));
  const ulimitPrefix = ulimitMemory ? `ulimit -v ${memoryLimitKb}; ` : "";
  const fullCmd = [runCmd.cmd, ...runCmd.args].join(" ");
  const script = `${ulimitPrefix}/usr/bin/time -v -o time.log timeout ${timeLimitSec}s ${fullCmd} < in.txt > out.txt 2> err.txt; echo $? > exit.txt`;

  await sandbox.runCommand({ cmd: "bash", args: ["-c", script], cwd: WORKDIR });

  const [exitBuf, outBuf, errBuf, timeBuf] = await Promise.all([
    sandbox.readFileToBuffer({ path: `${WORKDIR}/exit.txt` }),
    sandbox.readFileToBuffer({ path: `${WORKDIR}/out.txt` }),
    sandbox.readFileToBuffer({ path: `${WORKDIR}/err.txt` }),
    sandbox.readFileToBuffer({ path: `${WORKDIR}/time.log` }),
  ]);

  // `parseInt(...) || 1` would be wrong here: a legitimate exit code of 0 is falsy in JS and would
  // get silently clobbered to 1 (misreported as RE on every accepted run) — NaN needs an explicit check.
  const parsedExit = parseInt(exitBuf?.toString().trim() ?? "", 10);
  const exitCode = Number.isNaN(parsedExit) ? 1 : parsedExit;
  const stdout = (outBuf ?? Buffer.alloc(0)).subarray(0, OUTPUT_CAP_BYTES).toString();
  const stderr = (errBuf ?? Buffer.alloc(0)).toString();
  const { cpuMs, memoryKb } = parseTimeLog(timeBuf?.toString() ?? "");

  return {
    exitCode,
    stdout,
    stderr,
    timeMs: cpuMs ?? timeLimitMs,
    memoryKb,
    timedOut: exitCode === 124,
  };
}

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
    sandbox = await Sandbox.create({
      source: { type: "snapshot", snapshotId },
      persistent: false,
      resources: { vcpus: 1 },
      timeout: 90_000,
      networkPolicy: "deny-all",
    });

    await sandbox.writeFiles([{ path: `${WORKDIR}/${lang.sourceFileName}`, content: Buffer.from(sourceCode) }]);

    if (lang.compile) {
      const compile = await sandbox.runCommand({
        cmd: "bash",
        args: ["-c", `timeout ${COMPILE_TIMEOUT_SEC}s ${lang.compile.cmd} ${lang.compile.args.join(" ")}`],
        cwd: WORKDIR,
      });
      if (compile.exitCode !== 0) {
        return { status: "CE" as Verdict, compileError: (await compile.stderr()).slice(0, 8000) };
      }
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
