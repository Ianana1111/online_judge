import { Sandbox } from "@vercel/sandbox";
import type { LanguageSpec } from "./languages.js";

export const WORKDIR = "/vercel/sandbox";
export const OUTPUT_CAP_BYTES = 8 * 1024 * 1024; // 8MB — well above any sane CP answer; guards
// against a runaway-output submission ballooning memory in this worker process while we read its
// output back.
const COMPILE_TIMEOUT_SEC = 20;
// Generous relative to any legitimate CP-sized single-file submission (a few hundred MB at most,
// even for template-heavy C++) — this exists purely to cap a memory-bomb compile (a submission
// deliberately written to exhaust the compiler's own memory, e.g. via runaway template
// recursion), which previously had no ceiling at all beyond the 20s wall-clock timeout.
const COMPILE_MEMORY_LIMIT_KB = 1_048_576; // 1 GB

// Above this size, folding a file's content into the command line itself (as base64) stops being a
// win — the payload balloons ~33% over the raw size and starts pushing on the sandbox's own
// command-length limits — so it falls back to a real writeFiles call instead. Comfortably above any
// real CP-sized input/source (a few KB to tens of KB; even a deliberately large stress-test input
// is rarely near this), so the fast path is what almost every real submission actually takes.
const INLINE_WRITE_MAX_BYTES = 256 * 1024;

/** Returns a bash snippet that recreates `content` at `relPath` (relative to WORKDIR) via a single
 * `base64 -d`, meant to be prepended into a command that's about to run anyway — this is what lets
 * "write the input/source" and "run something that reads it" collapse into one sandbox.runCommand
 * round trip instead of a writeFiles call followed by a separate runCommand. Above
 * INLINE_WRITE_MAX_BYTES it just performs the write directly (a real writeFiles call, same as
 * before this existed) and returns "" for the caller to prepend nothing. */
async function inlineWriteOrFallback(sandbox: Sandbox, relPath: string, content: Buffer): Promise<string> {
  if (content.byteLength > INLINE_WRITE_MAX_BYTES) {
    await sandbox.writeFiles([{ path: `${WORKDIR}/${relPath}`, content }]);
    return "";
  }
  // Base64's alphabet (A-Za-z0-9+/=) has no shell metacharacters, so it's always safe to embed
  // inside a single-quoted string regardless of what the original content was.
  return `printf '%s' '${content.toString("base64")}' | base64 -d > ${relPath}; `;
}

export interface RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  timeMs: number;
  memoryKb: number | null;
  timedOut: boolean;
}

// GNU time's "Elapsed (wall clock) time" is formatted either "m:ss.cc" or "h:mm:ss" depending on
// duration — CP time limits are always well under an hour, but this handles both rather than
// assuming the shorter form.
function parseElapsedWallClock(raw: string): number | null {
  const parts = raw.split(":").map((p) => parseFloat(p));
  if (parts.some((p) => Number.isNaN(p))) return null;
  if (parts.length === 2) return Math.round((parts[0] * 60 + parts[1]) * 1000);
  if (parts.length === 3) return Math.round((parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000);
  return null;
}

/** Parses GNU `time -v` output for the fields judging cares about. Missing on parse failure
 * (rather than throwing) — a malformed time.log should degrade to "unknown timing," not abort an
 * otherwise-valid verdict.
 *
 * Reports wall-clock elapsed time, not CPU (user+system) time — the actual TLE enforcement below
 * is the `timeout` command wrapping the whole process, which kills based on wall-clock time. A
 * program that spends most of its time limit blocked (sleeping, or waiting on I/O) burns very
 * little CPU time but the same wall-clock time as a compute-bound program — reporting CPU time
 * would silently under-count exactly that case, showing a near-timeout submission as
 * suspiciously fast instead of reflecting how long it actually ran. */
function parseTimeLog(log: string): { wallMs: number | null; memoryKb: number | null } {
  const elapsedMatch = log.match(/Elapsed \(wall clock\) time[^:]*:\s*([\d:.]+)/);
  const memMatch = log.match(/Maximum resident set size \(kbytes\):\s*(\d+)/);
  const wallMs = elapsedMatch ? parseElapsedWallClock(elapsedMatch[1]) : null;
  const memoryKb = memMatch ? parseInt(memMatch[1], 10) : null;
  return { wallMs, memoryKb };
}

export async function runOneCase(
  sandbox: Sandbox,
  runCmd: { cmd: string; args: string[] },
  input: string,
  timeLimitMs: number,
  memoryLimitKb: number,
  ulimitMemory: boolean,
): Promise<RunResult> {
  // Folded into the run script below (see inlineWriteOrFallback) instead of a separate writeFiles
  // call first — cuts one full network round trip to the Sandbox API per test case, which used to
  // be paid N times per submission for no reason other than habit (writeFiles-then-runCommand is
  // the obvious way to write this, not the fastest one).
  const writeInput = await inlineWriteOrFallback(sandbox, "in.txt", Buffer.from(input));

  const timeLimitSec = Math.max(1, Math.ceil(timeLimitMs / 1000));
  const ulimitPrefix = ulimitMemory ? `ulimit -v ${memoryLimitKb}; ` : "";
  // `ulimit -f` is in 512-byte blocks and, unlike `-v`, is safe for every language including Java
  // (the JVM needs a large virtual address space but never needs to write huge files) — applying
  // it unconditionally caps out.txt/err.txt at the source (SIGXFSZ kills the offending process),
  // so a runaway-output submission can no longer make this worker read a multi-GB buffer into its
  // own memory via readFileToBuffer below.
  const fileSizeLimitBlocks = Math.ceil(OUTPUT_CAP_BYTES / 512);
  // A fork bomb (`:(){ :|:& };:`) or any runaway-forking submission has nothing to gain from more
  // than a handful of processes — no supported language's normal single-process CP solution needs
  // anywhere close to this many. `-u` is a per-user (not per-process-tree) limit, which is exactly
  // right here since each sandbox is a disposable microVM dedicated to one submission.
  const MAX_PROCESSES = 64;
  const fullCmd = [runCmd.cmd, ...runCmd.args].join(" ");
  const script = `${writeInput}ulimit -f ${fileSizeLimitBlocks}; ulimit -u ${MAX_PROCESSES}; ${ulimitPrefix}/usr/bin/time -v -o time.log timeout ${timeLimitSec}s ${fullCmd} < in.txt > out.txt 2> err.txt; echo $? > exit.txt`;

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
  const { wallMs, memoryKb } = parseTimeLog(timeBuf?.toString() ?? "");

  return {
    exitCode,
    stdout,
    stderr,
    timeMs: wallMs ?? timeLimitMs,
    memoryKb,
    timedOut: exitCode === 124,
  };
}

/** The SDK only auto-detects credentials from VERCEL_OIDC_TOKEN (short-lived, Vercel-hosted-only)
 * — a plain access token needs its {token, teamId, projectId} passed explicitly, or the SDK
 * throws trying to reach for an OIDC context that doesn't exist here (this worker runs on
 * Railway, not Vercel). Falls through to plain env-based OIDC detection when these are unset,
 * which is what local dev (`vercel env pull`) relies on. */
function resolveSandboxCredentials() {
  return process.env.VERCEL_TOKEN && process.env.VERCEL_TEAM_ID && process.env.VERCEL_PROJECT_ID
    ? { token: process.env.VERCEL_TOKEN, teamId: process.env.VERCEL_TEAM_ID, projectId: process.env.VERCEL_PROJECT_ID }
    : {};
}

/** Boots a fresh, network-isolated, disposable microVM from the pre-baked judge snapshot (see
 * scripts/build-snapshot.ts) — shared by both the real judge (judge.ts) and the ad-hoc "Run"
 * feature (testRun.ts) so a sandbox is always created the exact same way. */
export async function createJudgeSandbox(snapshotId: string, timeoutMs: number): Promise<Sandbox> {
  return Sandbox.create({
    ...resolveSandboxCredentials(),
    source: { type: "snapshot", snapshotId },
    persistent: false,
    resources: { vcpus: 1 },
    timeout: timeoutMs,
    networkPolicy: "deny-all",
  });
}

/** Writes the source file and compiles it (no-op for interpreted languages). Returns the compiler
 * stderr on failure so the caller can report a CE-style result without needing to know anything
 * else about the sandbox. */
export async function compileInSandbox(
  sandbox: Sandbox,
  lang: LanguageSpec,
  sourceCode: string,
): Promise<{ ok: true } | { ok: false; compileError: string }> {
  // Same round-trip fold as runOneCase's input — the source write rides along with the compile
  // command instead of needing its own writeFiles call first.
  const writeSource = await inlineWriteOrFallback(sandbox, lang.sourceFileName, Buffer.from(sourceCode));

  if (!lang.compile) {
    // Interpreted language: nothing to compile, but the source still needs to land on disk before
    // judge.ts's run loop starts — inlineWriteOrFallback already did that via writeFiles if the
    // source was too big to inline; otherwise the snippet it returned still needs to actually run.
    if (writeSource) await sandbox.runCommand({ cmd: "bash", args: ["-c", writeSource], cwd: WORKDIR });
    return { ok: true };
  }

  const compile = await sandbox.runCommand({
    cmd: "bash",
    args: [
      "-c",
      `${writeSource}ulimit -v ${COMPILE_MEMORY_LIMIT_KB}; timeout ${COMPILE_TIMEOUT_SEC}s ${lang.compile.cmd} ${lang.compile.args.join(" ")}`,
    ],
    cwd: WORKDIR,
  });
  if (compile.exitCode !== 0) {
    return { ok: false, compileError: (await compile.stderr()).slice(0, 8000) };
  }
  return { ok: true };
}
