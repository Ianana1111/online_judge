/** Read-only, repeatable snapshot of judge content; never queries accounts/submissions/payments.
 * Run from repository root:
 * node --env-file=.env --import ./packages/db/node_modules/tsx/dist/loader.mjs scripts/audit-project-data.ts /private/tmp/oj-content.json
 * Hidden inputs/outputs stay in the private snapshot. The committed report contains hashes only.
 */
import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { prisma } from "../packages/db/src/index";
import { checkProblemOutput } from "../apps/judge/src/local/checkers";
import { supportsLocalChecker } from "../packages/shared/src/judge";

const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
async function main() {
  const url = new URL(process.env.DATABASE_URL ?? "invalid:");
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) throw new Error("This command requires a local database or local read-only mirror.");
  const snapshotPath = process.argv[2];
  if (!snapshotPath?.startsWith("/private/tmp/")) throw new Error("Pass a private /private/tmp/ snapshot path; hidden test data must not enter the repository.");
  const data = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
    const problems = await tx.problem.findMany({ orderBy: { slug: "asc" }, include: { samples: { orderBy: { ord: "asc" } }, testCases: { orderBy: { ord: "asc" } } } });
    const contests = await tx.contest.findMany({ orderBy: { slug: "asc" }, include: { problems: { orderBy: { ord: "asc" } } } });
    return { problems, contests };
  }, { isolationLevel: "RepeatableRead", timeout: 30_000 });
  const capturedAt = new Date().toISOString();
  const contentHash = hash(data);
  await writeFile(snapshotPath, JSON.stringify({ capturedAt, contentHash, ...data }), { mode: 0o600, flag: "wx" });
  const manifestDir = new URL("../packages/db/audit/battery-manifests/", import.meta.url);
  const manifests = new Map<string, { candidates: { tag: string; languageKey: string; sourceCode: string }[] }>();
  for (const file of await readdir(manifestDir)) if (file.endsWith(".json")) {
    const m = JSON.parse(await readFile(new URL(file, manifestDir), "utf8")); manifests.set(m.slug, m);
  }
  const problemRows = data.problems.map((p) => {
    const errors: string[] = [], warnings: string[] = [];
    const manifest = manifests.get(p.slug);
    if (!p.statementMd.trim()) errors.push("empty-statement");
    if (!Number.isInteger(p.timeLimitMs) || p.timeLimitMs <= 0 || !Number.isInteger(p.memoryLimitKb) || p.memoryLimitKb <= 0) errors.push("invalid-resource-limit");
    if (!supportsLocalChecker(p)) errors.push("unsupported-local-checker");
    if (p.checkerType === "FLOAT" && (p.floatEps === null || !Number.isFinite(p.floatEps) || p.floatEps < 0)) errors.push("invalid-float-tolerance");
    if (!p.testCases.length && !(p.uvaId && p.uvaPid)) errors.push("no-judge-route");
    if (!p.testCases.length) warnings.push("remote-judge-required");
    if (!p.samples.length) warnings.push("no-public-sample");
    const byInput = new Map<string, string>();
    let duplicateInputs = 0, sampleOnlyCases = 0;
    for (const tc of p.testCases) {
      const prior = byInput.get(tc.input);
      if (prior !== undefined) {
        duplicateInputs++;
        try { if (!checkProblemOutput(p, tc.input, prior, tc.output)) errors.push(`contradictory-output-case-${tc.ord}`); } catch { /* checker error already reported */ }
      }
      byInput.set(tc.input, tc.output);
      if (p.samples.some((s) => s.input.replace(/\r\n/g, "\n").trim() === tc.input.replace(/\r\n/g, "\n").trim())) sampleOnlyCases++;
      for (const sample of p.samples.filter((s) => s.input === tc.input)) {
        try { if (!checkProblemOutput(p, tc.input, sample.output, tc.output)) errors.push(`sample-output-mismatch-case-${tc.ord}`); } catch { /* checker error already reported */ }
      }
    }
    if (duplicateInputs) warnings.push("duplicate-inputs");
    if (p.testCases.length && sampleOnlyCases === p.testCases.length) warnings.push("sample-only-coverage");
    if (!manifest?.candidates.some((c) => c.tag === "correct")) warnings.push("no-reference-candidate");
    if (!manifest?.candidates.some((c) => c.tag !== "correct")) warnings.push("no-wrong-solution-candidate");
    return { slug: p.slug, visible: p.visibility, cases: p.testCases.length, samples: p.samples.length, checker: p.checkerType, inputOutputHash: hash(p.testCases.map(({ ord, input, output }) => ({ ord, input, output }))), candidates: manifest?.candidates.length ?? 0, errors: [...new Set(errors)], warnings };
  });
  const problemsById = new Map(data.problems.map((p) => [p.id, p]));
  const contests = data.contests.map((c) => {
    const errors: string[] = [];
    if (!c.problems.length) errors.push("empty-exam");
    if (c.durationMin <= 0 || c.freezeMin < 0 || c.freezeMin > c.durationMin || c.penaltyMin < 0) errors.push("invalid-exam-timing");
    if (c.scoring !== "ICPC") errors.push("unsupported-scoring-mode");
    if (new Set(c.problems.map((p) => p.label)).size !== c.problems.length || c.problems.some((p) => !p.label.trim())) errors.push("duplicate-or-empty-labels");
    if (new Set(c.problems.map((p) => p.ord)).size !== c.problems.length) errors.push("duplicate-problem-order");
    for (const cp of c.problems) {
      const p = problemsById.get(cp.problemId);
      if (!p) errors.push(`missing-problem-${cp.label}`);
      else {
        if (!p.visibility) errors.push(`hidden-problem-${cp.label}`);
        if (p.testCases.length ? !supportsLocalChecker(p) : !(p.uvaId && p.uvaPid)) errors.push(`ungradeable-problem-${cp.label}`);
      }
    }
    return { slug: c.slug, public: c.isPublic, kind: c.kind, scheduled: c.startAt !== null, problems: c.problems.length, durationMin: c.durationMin, errors };
  });
  const report = { capturedAt, contentHash, scope: "Local project database; one read-only repeatable-read transaction. Structural checks only, not executed verdict evidence.", totals: { problems: data.problems.length, visibleProblems: data.problems.filter((p) => p.visibility).length, cases: data.problems.reduce((n, p) => n + p.testCases.length, 0), contests: contests.length, publicContests: contests.filter((c) => c.public).length, problemErrors: problemRows.filter((p) => p.errors.length).length, contestErrors: contests.filter((c) => c.errors.length).length, candidateProblems: problemRows.filter((p) => p.candidates).length }, problems: problemRows, contests };
  await writeFile(new URL("../docs/launch-readiness/content-inventory.json", import.meta.url), JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify({ snapshotPath, ...report.totals, contentHash }));
}
main().catch(() => { console.error("Content audit failed; no source database changes were made. Check the local connection and snapshot destination."); process.exitCode = 1; }).finally(() => prisma.$disconnect());
