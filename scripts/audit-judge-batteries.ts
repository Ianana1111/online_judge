import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { evaluateInSandbox } from "../apps/judge/src/local/evaluate";
import { createDockerSandbox } from "../tests/support/docker-sandbox";
import type { BatteryManifest } from "../apps/judge/src/audit/battery-types";
import type { Problem, TestCase } from "../packages/db/src/index";
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
async function main() {
  const snapshotPath = process.argv[2];
  if (!snapshotPath?.startsWith("/private/tmp/")) throw new Error("Pass the private content snapshot from audit-project-data.ts");
  const snapshot = JSON.parse(await readFile(snapshotPath, "utf8")) as { contentHash: string; problems: (Problem & { testCases: TestCase[] })[]; contests: unknown[] };
  if (hash({ problems: snapshot.problems, contests: snapshot.contests }) !== snapshot.contentHash) throw new Error("Snapshot hash does not match");
  const manifestDir = new URL("../packages/db/audit/battery-manifests/", import.meta.url);
  const problems = new Map(snapshot.problems.map((p) => [p.slug, p]));
  const regressions = process.argv.includes("--regressions");
  const contentChanges = regressions ? JSON.parse(await readFile(new URL("../packages/db/audit/launch-regressions.json", import.meta.url), "utf8")) as { cases: { slug: string; input: string; output: string }[]; corrections: { slug: string; input: string; previousOutput: string; output: string }[] } : { cases: [], corrections: [] };
  const additions = contentChanges.cases;
  const review = regressions ? JSON.parse(await readFile(new URL("../packages/db/audit/launch-candidate-review.json", import.meta.url), "utf8")) as { reviews: { slug: string; index: number; sourceHash: string; expected: string; reason: string }[]; additionalCandidates: (BatteryManifest["candidates"][number] & { slug: string })[] } : { reviews: [], additionalCandidates: [] };
  for (const p of snapshot.problems) if (regressions) {
    for (const correction of contentChanges.corrections.filter((c) => c.slug === p.slug)) for (const tc of p.testCases) if (tc.input === correction.input && tc.output === correction.previousOutput) tc.output = correction.output;
    if (p.uvaId === 10150 && p.checkerType === "IGNORE_TRAILING_WS") p.checkerType = "SPECIAL";
    for (const added of additions.filter((c) => c.slug === p.slug)) if (!p.testCases.some((c) => c.input === added.input)) p.testCases.push({ ...added, id: "audit-only", problemId: p.id, ord: Math.max(0, ...p.testCases.map((c) => c.ord)) + 1 });
  }
  const results: { slug: string; inputOutputHash: string; candidates: unknown[] }[] = [];
  const failures: { slug: string; index: number; tag: string; verdict: string }[] = [];
  const reportPath = new URL(`../docs/launch-readiness/${regressions ? "judge-regression-results" : "judge-battery-results"}.json`, import.meta.url);
  const observations = review.reviews.filter((r) => r.expected === "OBSERVE");
  const skipped: string[] = [];
  const write = async (complete: boolean) => writeFile(reportPath, JSON.stringify({ testedAt: new Date().toISOString(), contentHash: snapshot.contentHash, regressions, environment: "Disposable Debian bookworm Docker, 1 CPU, network none, no host mount. Actual production compile/run/checker code. Vercel timing/toolchain still requires separate validation.", expectations: "Baseline uses authored tags. Regression sweep applies source-hash-bound reviews and adds reviewed corrected references. OBSERVE means the candidate's alleged defect is not a proven rejection requirement, not a completed correctness proof.", complete, problems: results.length, skippedRemoteProblems: skipped, observations, failures, results }, null, 2) + "\n");
  for (const file of (await readdir(manifestDir)).filter((f) => f.endsWith(".json")).sort()) {
    const manifest = JSON.parse(await readFile(new URL(file, manifestDir), "utf8")) as BatteryManifest;
    const problem = problems.get(manifest.slug);
    if (!problem?.testCases.length) { skipped.push(manifest.slug); continue; }
    manifest.candidates.push(...review.additionalCandidates.filter((c) => c.slug === manifest.slug));
    const row = { slug: manifest.slug, inputOutputHash: hash(problem.testCases.map(({ ord, input, output }) => ({ ord, input, output }))), candidates: [] as unknown[] };
    for (const [index, c] of manifest.candidates.entries()) {
      const fixture = await createDockerSandbox();
      let lastCase: number | undefined;
      let result;
      try { result = await evaluateInSandbox(fixture.sandbox, problem, problem.testCases, c.languageKey, c.sourceCode, { caseFinished: (ord) => { lastCase = ord; } }); }
      catch { result = { status: "SE" }; }
      finally { await fixture.stop(); }
      const reviewed = review.reviews.find((r) => r.slug === manifest.slug && r.index === index);
      if (reviewed && reviewed.sourceHash !== hash(c.sourceCode)) throw new Error(`Candidate changed since review: ${manifest.slug} #${index}`);
      const expectation = reviewed?.expected ?? (c.tag === "correct" ? "AC" : "REJECT");
      const matched = expectation === "OBSERVE" ? null : expectation === "AC" ? result.status === "AC" : result.status !== "AC" && result.status !== "SE" && result.status !== "CE";
      row.candidates.push({ index, tag: c.tag, label: c.label, language: c.languageKey, sourceHash: hash(c.sourceCode), expectation, reviewReason: reviewed?.reason, verdict: result.status, timeMs: result.timeMs, memoryKb: result.memoryKb, lastCase, matched });
      if (matched === false || result.status === "SE") failures.push({ slug: manifest.slug, index, tag: c.tag, verdict: result.status });
    }
    results.push(row); await write(false);
    console.log(`${results.length}: ${manifest.slug}: ${JSON.stringify(row.candidates.map((c) => { const v = c as { tag: string; verdict: string }; return `${v.tag}=${v.verdict}`; }))}`);
  }
  await write(true);
  console.log(JSON.stringify({ problems: results.length, candidates: results.reduce((n, r) => n + r.candidates.length, 0), mismatches: failures.length }));
  if (failures.length) process.exitCode = 1;
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Battery audit failed"); process.exitCode = 1; });
