import { afterEach, expect, it, vi } from "vitest";
import { judgeLocally } from "../apps/judge/src/local/judge";
import { runTestCases } from "../apps/judge/src/local/testRun";
import { judgeViaUva } from "../apps/judge/src/remote/uva";
import { logSandboxApiError } from "../apps/judge/src/local/sandboxRun";
import type { Problem, TestCase } from "@oj/db";

const fixtures = vi.hoisted(() => ({ error: Object.assign(new Error("private-code bearer-secret postgres://private-connection"), { status: 503, text: "private-code", json: { authorization: "bearer-secret" } }) }));
vi.mock("../packages/db/src/index.ts", () => ({ prisma: { problem: { findUnique: vi.fn().mockResolvedValue({ visibility: true, timeLimitMs: 1000, memoryLimitKb: 65536, samples: [] }) } } }));
vi.mock("../apps/judge/src/local/sandboxRun.js", async (original) => ({ ...await original<typeof import("../apps/judge/src/local/sandboxRun")>(), createJudgeSandbox: vi.fn().mockRejectedValue(fixtures.error) }));
vi.mock("../apps/judge/src/local/sandboxPool.js", () => ({ notePoolActivity: vi.fn(), tryClaimPooledSandbox: vi.fn().mockResolvedValue(null) }));
vi.mock("../apps/judge/src/remote/uvaClient.js", () => ({ uvaLogin: vi.fn().mockRejectedValue(fixtures.error), fetchMyStatus: vi.fn(), submitSolution: vi.fn(), mapUvaVerdictText: vi.fn() }));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

it.each([
  [{ response: { status: 402 }, json: { error: { message: "bearer-secret private-code" } } }, 402],
  [{ response: { statusCode: 403 } }, 403],
  [{ status: 503 }, 503],
  [{ statusCode: 429 }, 429],
  [{ response: { status: "bearer-secret" } }, null],
  [{ response: { status: 200.5 } }, null],
  [null, null],
])("logs only a valid HTTP status from provider errors", (error, status) => {
  const logs = vi.spyOn(console, "error").mockImplementation(() => {});
  logSandboxApiError("fixture", error);
  expect(logs).toHaveBeenCalledWith("[fixture] sandbox operation failed", { status });
  expect(JSON.stringify(logs.mock.calls)).not.toMatch(/bearer-secret|private-code/);
});

it.each(["local", "run", "remote"])("%s infrastructure failure does not expose provider secrets or source text", async (kind) => {
  vi.stubEnv("JUDGE_SANDBOX_SNAPSHOT_ID", "fixture-snapshot"); vi.stubEnv("UVA_BOT_USERNAME", "fixture"); vi.stubEnv("UVA_BOT_PASSWORD", "fixture");
  const logs = vi.spyOn(console, "error").mockImplementation(() => {}); vi.spyOn(console, "log").mockImplementation(() => {});
  const problem = { id: "fixture", uvaId: 100, uvaPid: 36 } as Problem;
  const result = kind === "local" ? await judgeLocally(problem, [{} as TestCase], "cpp17", "private-code")
    : kind === "run" ? await runTestCases("fixture-run", problem.id, "cpp17", "private-code", [{ id: "case", input: "1" }])
    : await judgeViaUva(problem, "cpp17", "private-code");
  expect(result.status).toBe(kind === "run" ? "ERROR" : "SE");
  expect(result.compileError).toMatch(/try again/i);
  expect(JSON.stringify({ result, logs: logs.mock.calls })).not.toMatch(/private-code|bearer-secret|private-connection|authorization/);
});
