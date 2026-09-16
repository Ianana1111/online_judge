import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createRunSchema } from "../packages/shared/src/schemas";
import { runTestCases } from "../apps/judge/src/local/testRun";
import { evaluateInSandbox } from "../apps/judge/src/local/evaluate";
import { checkProblemOutput } from "../apps/judge/src/local/checkers";
import type { Sandbox } from "@vercel/sandbox";

const fixture = vi.hoisted(() => ({ find: vi.fn(), run: vi.fn(), compile: vi.fn(), stop: vi.fn() }));
vi.mock("../packages/db/src/index.ts", () => ({ prisma: { problem: { findUnique: fixture.find } } }));
vi.mock("../apps/judge/src/local/sandboxPool.js", () => ({ notePoolActivity: vi.fn(), tryClaimPooledSandbox: vi.fn().mockResolvedValue(null) }));
vi.mock("../apps/judge/src/local/sandboxRun.js", () => ({ OUTPUT_CAP_BYTES: 8 * 1024 * 1024, createJudgeSandbox: vi.fn(async () => ({ stop: fixture.stop })), compileInSandbox: fixture.compile, runOneCase: fixture.run, logSandboxApiError: vi.fn() }));
const problem = { visibility: true, timeLimitMs: 1000, memoryLimitKb: 65536, checkerType: "IGNORE_TRAILING_WS" as const, floatEps: null, uvaId: 100, slug: "test", samples: [{ ord: 1, input: "1\n", output: "  hello\n" }] };
const execution = { timedOut: false, exitCode: 0, stdout: "  hello \r\n", stderr: "", memoryKb: 100, timeMs: 10 };
beforeEach(() => { vi.stubEnv("JUDGE_SANDBOX_SNAPSHOT_ID", "test-snapshot"); fixture.find.mockResolvedValue(problem); fixture.compile.mockResolvedValue({ ok: true }); fixture.run.mockResolvedValue(execution); fixture.stop.mockResolvedValue(undefined); vi.spyOn(console, "log").mockImplementation(() => {}); });
afterEach(() => vi.unstubAllEnvs());

it("validates sample references and bounded custom inputs without trusting client answers", () => {
  const base = { problemId: "c000000000000000000000001", languageKey: "cpp17", sourceCode: "source" };
  for (const cases of [[{ id: "x" }], [{ id: "x", input: "a".repeat(4097) }], [{ id: "x", sampleOrd: -1 }], [{ id: "x", input: "" }, { id: "x", input: "" }]]) expect(createRunSchema.safeParse({ ...base, cases }).success).toBe(false);
  const parsed = createRunSchema.parse({ ...base, cases: [{ id: "x", sampleOrd: 1, expectedOutput: "forged" }] });
  expect(parsed.cases[0]).toEqual({ id: "x", sampleOrd: 1 });
});
it.each([
  [execution, "AC"], [{ ...execution, stdout: "hello\n" }, "WA"],
  [{ ...execution, timedOut: true }, "TLE"], [{ ...execution, exitCode: 1 }, "RE"],
  [{ ...execution, exitCode: 1, stderr: "MemoryError" }, "MLE"], [{ ...execution, memoryKb: 65537 }, "MLE"],
  [{ ...execution, exitCode: 153 }, "OLE"],
] as const)("uses the same comparison and resource verdict as Submit: %j → %s", async (run, verdict) => {
  fixture.run.mockResolvedValue(run);
  const sample = await runTestCases("run", "problem", "cpp17", "source", [{ id: "sample", sampleOrd: 1 }]);
  const submit = await evaluateInSandbox({} as Sandbox, problem, [problem.samples[0]], "cpp17", "source");
  expect(sample.cases?.[0].verdict).toBe(verdict); expect(submit.status).toBe(verdict);
});
it("runs edited inputs without comparing them against the original sample", async () => {
  fixture.run.mockResolvedValue({ ...execution, stdout: "different but correct for custom input" });
  const result = await runTestCases("run", "problem", "cpp17", "source", [{ id: "sample", input: "2\n" }]);
  expect(result.cases?.[0].verdict).toBeUndefined(); expect(result.status).toBe("DONE");
});
it("compares full output before display truncation", async () => {
  const output = "answer\n".repeat(20000); fixture.find.mockResolvedValue({ ...problem, samples: [{ ord: 1, input: "", output }] });
  fixture.run.mockResolvedValue({ ...execution, stdout: output });
  const result = await runTestCases("run", "problem", "cpp17", "source", [{ id: "sample", sampleOrd: 1 }]);
  expect(result.cases?.[0]).toMatchObject({ verdict: "AC", outputTruncated: true }); expect(result.cases?.[0].stdout).toHaveLength(100000);
});
it("resolves large official sample inputs on the server", async () => {
  const input = "1\n".repeat(3000); fixture.find.mockResolvedValue({ ...problem, samples: [{ ...problem.samples[0], input }] });
  await runTestCases("run", "problem", "cpp17", "source", [{ id: "sample", sampleOrd: 1 }]);
  expect(fixture.run.mock.calls.at(-1)?.[2]).toBe(input);
});
it.each([[{ id: "x", sampleOrd: 9 }], [{ id: "x", sampleOrd: 1, input: "tampered" }]])("rejects missing or changed sample references", async (cases) => {
  expect((await runTestCases("run", "problem", "cpp17", "source", cases)).status).toBe("ERROR"); expect(fixture.run).not.toHaveBeenCalled();
});
it("honors FLOAT tolerances and SPECIAL alternative answers through the same checker", async () => {
  fixture.find.mockResolvedValue({ ...problem, checkerType: "FLOAT", floatEps: 0.01, samples: [{ ord: 1, input: "", output: "Result 1.00" }] });
  fixture.run.mockResolvedValue({ ...execution, stdout: "Result 1.001\n" });
  expect((await runTestCases("run", "problem", "cpp17", "source", [{ id: "x", sampleOrd: 1 }])).cases?.[0].verdict).toBe("AC");
  const special = { ...problem, checkerType: "SPECIAL" as const, uvaId: 10150, samples: [{ ord: 1, input: "cat\ncot\ncog\ndog\ndot\n\ncat dog\n", output: "cat\ncot\ncog\ndog\n" }] };
  const alternate = "cat\ncot\ndot\ndog\n";
  expect(checkProblemOutput(special, special.samples[0].input, special.samples[0].output, alternate)).toBe(true);
  fixture.find.mockResolvedValue(special); fixture.run.mockResolvedValue({ ...execution, stdout: alternate });
  expect((await runTestCases("run", "problem", "cpp17", "source", [{ id: "x", sampleOrd: 1 }])).cases?.[0].verdict).toBe("AC");
});
