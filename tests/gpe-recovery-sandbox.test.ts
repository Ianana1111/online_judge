import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { CheckerType } from "../packages/db/src/index";
import type { BatteryManifest } from "../apps/judge/src/audit/battery-types";
import { evaluateInSandbox } from "../apps/judge/src/local/evaluate";
import { createDockerSandbox } from "./support/docker-sandbox";

type RecoveryProblem = {
  slug: string; checkerType: CheckerType; timeLimitMs: number; memoryLimitKb: number;
  cases: { input: string; output: string }[];
};
const { problems } = JSON.parse(readFileSync(new URL("../packages/db/audit/gpe-recovery-cases.json", import.meta.url), "utf8")) as { problems: RecoveryProblem[] };
const candidates = problems.flatMap((problem) => {
  const manifest = JSON.parse(readFileSync(new URL("../packages/db/audit/battery-manifests/" + problem.slug + ".json", import.meta.url), "utf8")) as BatteryManifest;
  return manifest.candidates.map((candidate) => ({ ...candidate, problem, name: problem.slug + ": " + candidate.label }));
});

describe.skipIf(process.env.RUN_SANDBOX_TESTS !== "1")("GPE recovery references and wrong variants through the production evaluator", () => {
  let fixture: Awaited<ReturnType<typeof createDockerSandbox>> | undefined;
  beforeEach(async () => { fixture = await createDockerSandbox(); }, 60_000);
  afterEach(async () => { await fixture?.stop(); fixture = undefined; }, 30_000);
  it.each(candidates)("$name", async ({ problem, languageKey, sourceCode, tag }) => {
    const result = await evaluateInSandbox(fixture!.sandbox, { ...problem, uvaId: null, floatEps: null }, problem.cases.map((testcase, i) => ({ ...testcase, ord: i + 1 })), languageKey, sourceCode);
    expect(result.status).toBe(tag === "correct" ? "AC" : "WA");
  }, 60_000);
});
