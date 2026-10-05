/** Trusted main-branch canary. Reads one public problem; no production writes or real-user code. */
import { createRedisConnection } from "../../apps/api/src/common/redis.providers";
import { configureSandboxCapacity } from "../../apps/judge/src/local/sandboxCapacity";
import { randomUUID } from "node:crypto";
import { prisma } from "../../packages/db/src/index";
import { judgeLocally } from "../../apps/judge/src/local/judge";
import { runTestCases } from "../../apps/judge/src/local/testRun";
import { OPS_CANARY_SOURCES } from "./synthetic-sources";
let redis: ReturnType<typeof createRedisConnection> | undefined;
async function main() {
  if (process.env.JUDGEOPS_LIVE_CANARY !== "1" || !process.env.JUDGE_SANDBOX_SNAPSHOT_ID) throw new Error("Explicit canary configuration required");
  redis = createRedisConnection(); configureSandboxCapacity(redis);
  const problem = await prisma.problem.findFirst({ where: { uvaId: 100, visibility: true }, include: { samples: { orderBy: { ord: "asc" } } } });
  if (!problem || !problem.samples.length) throw new Error("Public canary problem unavailable");
  const checks: { name: string; status: string; durationMs: number; detail: string }[] = [];
  const testCases = [{ id: randomUUID(), problemId: problem.id, ord: 0, input: "1 10\n10 1\n", output: "1 10 20\n10 1 20\n", isSample: false, weight: 1 }];
  for (const [language, code] of Object.entries(OPS_CANARY_SOURCES)) {
    let started = Date.now();
    const sample = await runTestCases(randomUUID(), problem.id, language, code, [{ id: "canary", sampleOrd: problem.samples[0].ord }]);
    checks.push({ name: `live-${language}-sample`, status: sample.status === "DONE" && sample.cases?.[0]?.verdict === "AC" ? "PASS" : "FAIL", durationMs: Date.now() - started, detail: `Production sample engine / Vercel: ${sample.cases?.[0]?.verdict ?? sample.status}` });
    started = Date.now();
    const submission = await judgeLocally(problem, testCases, language, code);
    checks.push({ name: `live-${language}-judge`, status: submission.status === "AC" ? "PASS" : "FAIL", durationMs: Date.now() - started, detail: `Production judge engine / bounded synthetic tests: ${submission.status}` });
    if (sample.status === "ERROR" || submission.status === "SE") break; // avoid repeatedly consuming a broken service
  }
  if (checks.every(c => c.status === "PASS")) {
    let started = Date.now(); const wa = await runTestCases(randomUUID(), problem.id, "cpp17", '#include <cstdio>\nint main(){std::puts("0");}', [{ id: "canary", sampleOrd: problem.samples[0].ord }]);
    checks.push({ name: "live-wrong-answer", status: wa.cases?.[0]?.verdict === "WA" ? "PASS" : "FAIL", durationMs: Date.now() - started, detail: "Known incorrect output must be rejected" });
    started = Date.now(); const ce = await runTestCases(randomUUID(), problem.id, "cpp17", "int main( {", [{ id: "canary", sampleOrd: problem.samples[0].ord }]);
    checks.push({ name: "live-compile-error", status: ce.status === "COMPILE_ERROR" ? "PASS" : "FAIL", durationMs: Date.now() - started, detail: "Invalid syntax must report compile error" });
  }
  console.log(JSON.stringify({ event: "judgeops-canary", checks }));
}
main().catch(() => { console.log(JSON.stringify({ event: "judgeops-canary", checks: [{ name: "live-judge", status: "FAIL", durationMs: 0, detail: "Canary could not finish; no sensitive diagnostic details uploaded" }] })); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); await redis?.quit(); });
