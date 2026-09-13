import type { Sandbox } from "@vercel/sandbox";
import type { Problem, TestCase } from "@oj/db";
import type { JudgeOutcome } from "../remote/uva.js";
import { LANGUAGES } from "./languages.js";
import { checkProblemOutput } from "./checkers.js";
import { OUTPUT_CAP_BYTES, compileInSandbox, runOneCase } from "./sandboxRun.js";

/** One verdict implementation shared by the deployed worker and offline container audit.
 * Sandbox creation/credentials/lifetime are the caller's responsibility. */
export async function evaluateInSandbox(
  sandbox: Sandbox,
  problem: Pick<Problem, "timeLimitMs" | "memoryLimitKb" | "checkerType" | "floatEps" | "uvaId">,
  testCases: Pick<TestCase, "ord" | "input" | "output">[],
  languageKey: string,
  sourceCode: string,
  trace?: { compiled?: () => void; caseFinished?: (ord: number, wallMs: number) => void },
): Promise<JudgeOutcome> {
  const lang = LANGUAGES[languageKey];
  if (!lang || !testCases.length) throw new Error("Unsupported language or missing test data");
  const compiled = await compileInSandbox(sandbox, lang, sourceCode);
  trace?.compiled?.();
  if (!compiled.ok) return { status: "CE", compileError: compiled.compileError };
  const timeLimitMs = problem.timeLimitMs * lang.timeMultiplier;
  let maxTimeMs = 0, maxMemoryKb: number | undefined;
  for (const tc of testCases) {
    const started = Date.now();
    const run = await runOneCase(sandbox, lang.runCmd({ memKb: problem.memoryLimitKb }), tc.input, timeLimitMs, problem.memoryLimitKb, lang.ulimitMemory);
    trace?.caseFinished?.(tc.ord, Date.now() - started);
    maxTimeMs = Math.max(maxTimeMs, run.timeMs);
    if (run.memoryKb !== null) maxMemoryKb = Math.max(maxMemoryKb ?? 0, run.memoryKb);
    const metrics = { timeMs: maxTimeMs, memoryKb: maxMemoryKb };
    if (run.timedOut) return { status: "TLE", ...metrics };
    if (run.exitCode !== 0) {
      const mle = /bad_alloc|cannot allocate memory|memoryerror|outofmemoryerror|std::length_error/i.test(run.stderr);
      return { status: run.exitCode === 153 ? "OLE" : mle ? "MLE" : "RE", ...metrics };
    }
    if (run.memoryKb !== null && run.memoryKb > problem.memoryLimitKb) return { status: "MLE", ...metrics };
    if (Buffer.byteLength(run.stdout) >= OUTPUT_CAP_BYTES) return { status: "OLE", ...metrics };
    if (!checkProblemOutput(problem, tc.input, tc.output, run.stdout)) return { status: "WA", ...metrics };
  }
  return { status: "AC", timeMs: maxTimeMs, memoryKb: maxMemoryKb, score: 100 };
}
