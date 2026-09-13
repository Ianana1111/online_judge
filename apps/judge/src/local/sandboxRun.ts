import { Sandbox } from "@vercel/sandbox";
import type { LanguageSpec } from "./languages.js";

export const WORKDIR = "/vercel/sandbox";
export const OUTPUT_CAP_BYTES = 8 * 1024 * 1024; // 8MB — well above any sane CP answer; guards
// against a runaway-output submission ballooning memory in this worker process while we read its
// output back.
const COMPILE_TIMEOUT_SEC = 20;
const PROGRAM_DIR = `${WORKDIR}/program`;
const CONTROL_DIR = `${WORKDIR}/.oj-control`;
const RUNNER_UID = 60001;
function shellQuote(value: string) { return "'" + value.replace(/'/g, "'\\''") + "'"; }
function unprivileged(command: string) {
  return `env -i PATH=/usr/local/bin:/usr/bin:/bin HOME=/nonexistent LANG=C.UTF-8 TMPDIR=/tmp setpriv --reuid=${RUNNER_UID} --regid=${RUNNER_UID} --clear-groups --no-new-privs --bounding-set=-all bash -c ${shellQuote(command)}`;
}
async function runTrusted(sandbox: Sandbox, script: string) {
  return sandbox.runCommand({ cmd: "bash", args: ["-c", script], cwd: WORKDIR, sudo: true });
}

// Generous relative to any legitimate CP-sized single-file submission (a few hundred MB at most,
// even for template-heavy C++) — this exists purely to cap a memory-bomb compile (a submission
// deliberately written to exhaust the compiler's own memory, e.g. via runaway template
// recursion), which previously had no ceiling at all beyond the 20s wall-clock timeout.
const COMPILE_MEMORY_LIMIT_KB = 1_048_576; // 1 GB

// Above this size, folding a file's content into the command line itself (as base64) stops being a
// win — the payload balloons ~33% over the raw size and starts pushing on the sandbox API's own
// request-size limits — so it falls back to a real writeFiles call instead. Originally set to
// 256KB on the theory that it was "comfortably above any real CP-sized input" — that theory was
// wrong: a real 169596-byte stress-test input (uva-10193, "All You Need Is Love!") stayed under
// that 256KB ceiling and still got embedded inline, and the resulting ~226KB command body got
// rejected by the Sandbox API with a bare "Status code 400 is not ok" (no size-specific error
// surfaced client-side — see judge.ts/testRun.ts's catch blocks, which now log the API's raw
// response body for exactly this kind of case). Every real CP problem's test data can include a
// stress-test input in the hundreds of KB, so this needs to stay well clear of wherever the actual
// limit is, not just "seem generous" — 32KB keeps the inline fast path for the overwhelming
// majority of real inputs while routing anything sizeable through the always-safe writeFiles path.
const INLINE_WRITE_MAX_BYTES = 32 * 1024;

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

/** @vercel/sandbox's APIError carries the actual response body on .text/.json, which its own
 * .message never includes (every API failure just says "Status code {n} is not ok") — diagnosing
 * a real one of these (a 400 from a too-large inlined command, see INLINE_WRITE_MAX_BYTES above)
 * required manually reconstructing the cause from submission data since nothing logged the body.
 * Call from a judge/testRun catch block so the next infra failure is diagnosable from Railway logs
 * alone. */
export function logSandboxApiError(context: string, err: unknown): void {
  const apiErr = err as { text?: string; json?: unknown } | undefined;
  if (apiErr?.text || apiErr?.json) {
    console.error(`[${context}] sandbox API error detail:`, apiErr.text ?? apiErr.json);
  }
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
  // GNU time's real label is "Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.30" (verified
  // against actual `/usr/bin/time -v` output) — the old [^:]* here couldn't match past the colon
  // inside that "(h:mm:ss" parenthetical, so this never matched anything, ever, on any submission:
  // every single timeMs silently fell back to the problem's timeLimitMs (see the ?? below) instead
  // of a real measurement. Matching the literal parenthetical fixes it.
  const elapsedMatch = log.match(/Elapsed \(wall clock\) time \(h:mm:ss or m:ss\):\s*([\d:.]+)/);
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

  if (!Number.isFinite(timeLimitMs) || timeLimitMs <= 0 || !Number.isSafeInteger(memoryLimitKb) || memoryLimitKb < 1024) throw new Error("Invalid judge resource limits");
  const timeLimitSec = timeLimitMs / 1000;
  const memory = ulimitMemory ? `ulimit -v ${memoryLimitKb}; ` : "";
  // Bash uses KiB for -f. Limits are inherited, and NNP blocks setuid/sudo escalation.
  const limits = `ulimit -f ${Math.ceil(OUTPUT_CAP_BYTES / 1024)}; ulimit -u 64; ulimit -c 0; ${memory}`;
  const command = [runCmd.cmd, ...runCmd.args].map(shellQuote).join(" ");
  // Keep timeout's own diagnostic separate from the student's stderr. An intentional exit 124
  // or self-SIGKILL 137 is a runtime error, not evidence that the deadline fired.
  const childCommand = `exec ${unprivileged(limits + "exec " + command)} 2> ${CONTROL_DIR}/err.txt`;
  // The trusted parent owns timing, exit status and output paths. Student code has a fresh
  // writable cwd each case, frozen program files, no shared group and no control-file access.
  const script = `${writeInput}set -eu; mv in.txt ${CONTROL_DIR}/in.txt;
case_dir=$(mktemp -d /tmp/oj-case.XXXXXX);
cp -a ${PROGRAM_DIR}/. "$case_dir/"; chown ${RUNNER_UID}:${RUNNER_UID} "$case_dir"; chmod 700 "$case_dir";
cd "$case_dir";
set +e;
LC_ALL=C /usr/bin/time -v -o ${CONTROL_DIR}/time.log timeout --verbose --kill-after=0.2s ${timeLimitSec}s bash -c ${shellQuote(childCommand)} < ${CONTROL_DIR}/in.txt > ${CONTROL_DIR}/out.txt 2> ${CONTROL_DIR}/timeout.log;
status=$?;
pkill -KILL -u ${RUNNER_UID} 2>/dev/null || true;
set -e;
printf '%s' "$status" > ${CONTROL_DIR}/exit.txt;
cd ${WORKDIR}; rm -rf -- "$case_dir";
for scratch in /tmp /var/tmp /dev/shm /run/lock; do if [ -d "$scratch" ]; then find "$scratch" -xdev -depth -uid ${RUNNER_UID} -delete; fi; done;
for name in exit.txt out.txt err.txt time.log timeout.log; do cp ${CONTROL_DIR}/"$name" ${WORKDIR}/"$name"; chmod 644 ${WORKDIR}/"$name"; done`;
  const execution = await runTrusted(sandbox, script);
  if (execution.exitCode !== 0) throw new Error("Trusted judge runner failed");

  const [exitBuf, outBuf, errBuf, timeBuf, timeoutBuf] = await Promise.all([
    sandbox.readFileToBuffer({ path: `${WORKDIR}/exit.txt` }),
    sandbox.readFileToBuffer({ path: `${WORKDIR}/out.txt` }),
    sandbox.readFileToBuffer({ path: `${WORKDIR}/err.txt` }),
    sandbox.readFileToBuffer({ path: `${WORKDIR}/time.log` }),
    sandbox.readFileToBuffer({ path: `${WORKDIR}/timeout.log` }),
  ]);

  // `parseInt(...) || 1` would be wrong here: a legitimate exit code of 0 is falsy in JS and would
  // get silently clobbered to 1 (misreported as RE on every accepted run) — NaN needs an explicit check.
  const parsedExit = parseInt(exitBuf?.toString().trim() ?? "", 10);
  const exitCode = Number.isNaN(parsedExit) ? 1 : parsedExit;
  const stdout = (outBuf ?? Buffer.alloc(0)).subarray(0, OUTPUT_CAP_BYTES).toString();
  const stderr = (errBuf ?? Buffer.alloc(0)).subarray(0, OUTPUT_CAP_BYTES).toString();
  const { wallMs, memoryKb } = parseTimeLog(timeBuf?.toString() ?? "");

  return {
    exitCode,
    stdout,
    stderr,
    timeMs: wallMs ?? timeLimitMs,
    memoryKb,
    timedOut: /timeout: sending signal/.test(timeoutBuf?.toString() ?? ""),
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
  const writeSource = await inlineWriteOrFallback(sandbox, lang.sourceFileName, Buffer.from(sourceCode));
  const setup = `${writeSource}set -eu; command -v setpriv; command -v pkill;
install -d -m 700 ${CONTROL_DIR}; install -d -m 700 -o ${RUNNER_UID} -g ${RUNNER_UID} ${PROGRAM_DIR};
install -m 600 -o ${RUNNER_UID} -g ${RUNNER_UID} ${shellQuote(lang.sourceFileName)} ${PROGRAM_DIR}/${shellQuote(lang.sourceFileName)};
rm -f ${shellQuote(lang.sourceFileName)};`;
  const prepared = await runTrusted(sandbox, setup);
  if (prepared.exitCode !== 0) throw new Error("Judge snapshot is missing isolation prerequisites");
  let ok = true, compileError = "";
  if (lang.compile) {
    const command = [lang.compile.cmd, ...lang.compile.args].map(shellQuote).join(" ");
    const memoryKb = lang.compile.cmd === "javac" ? COMPILE_MEMORY_LIMIT_KB * 2 : COMPILE_MEMORY_LIMIT_KB;
    const compile = await runTrusted(sandbox, `cd ${PROGRAM_DIR}; ${unprivileged(`ulimit -v ${memoryKb}; ulimit -u 64; ulimit -f 65536; ulimit -c 0; exec timeout --kill-after=0.2s ${COMPILE_TIMEOUT_SEC}s ${command}`)} > ${CONTROL_DIR}/compile.txt 2>&1;
status=$?; pkill -KILL -u ${RUNNER_UID} 2>/dev/null || true; set -e;
head -c 8000 ${CONTROL_DIR}/compile.txt > ${WORKDIR}/compile.txt; chmod 644 ${WORKDIR}/compile.txt; exit "$status"`);
    ok = compile.exitCode === 0;
    if (!ok) compileError = (await sandbox.readFileToBuffer({ path: `${WORKDIR}/compile.txt` }))?.subarray(0, 8000).toString() ?? "Compilation failed";
  }
  const frozen = await runTrusted(sandbox, `chown -R root:root ${PROGRAM_DIR}; chmod -R a-w,a+rX ${PROGRAM_DIR}`);
  if (frozen.exitCode !== 0) throw new Error("Could not freeze the compiled program");
  return ok ? { ok: true } : { ok: false, compileError };
}
