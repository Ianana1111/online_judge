import type { Sandbox } from "@vercel/sandbox";
import type { Problem, TestCase } from "@oj/db";
import type { JudgeOutcome } from "../remote/uva.js";
import { LANGUAGES } from "./languages.js";
import { checkProblemOutput } from "./checkers.js";
import { compileInSandbox, runOneCase } from "./sandboxRun.js";
import { runtimeVerdict } from "./runVerdict.js";

/** One verdict implementation shared by the deployed worker and offline container audit.
 * Sandbox creation/credentials/lifetime are the caller's responsibility. */
export async function evaluateInSandbox(
  sandbox: Sandbox,
  problem: Pick<Problem, "timeLimitMs" | "memoryLimitKb" | "checkerType" | "floatEps" | "uvaId"> & Partial<Pick<Problem, "slug">>,
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
    const failure = runtimeVerdict(run, problem.memoryLimitKb);
    if (failure) return { status: failure, ...metrics };
    if (!checkProblemOutput(problem, tc.input, tc.output, run.stdout)) return { status: "WA", ...metrics };
  }
  return { status: "AC", timeMs: maxTimeMs, memoryKb: maxMemoryKb, score: 100 };
}
