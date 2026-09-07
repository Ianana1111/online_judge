/**
 * Tier 1 of the judge-rigor verification audit (see the audit plan): runs every candidate in one
 * or more problems' battery manifests against that problem's CURRENT local TestCase rows, via the
 * exact same judgeLocally() the real judge worker uses — but called directly, never through
 * apps/api's HTTP/queue pipeline, so nothing is written to the Submission table (judgeLocally
 * itself has no DB side effects; see judge.ts).
 *
 * Free and unbounded — no external rate limit applies here, so run this against as many problems
 * per session as you like. Its job is to find every candidate that's WRONGLY passing locally
 * (thin test data missed the flaw) or WRONGLY failing locally (the reference solution itself is
 * broken, or the local checker/limits are miscalibrated) — those are exactly the candidates
 * run-remote-check.ts needs to confirm against the real UVa judge.
 *
 * Usage (from apps/judge):
 *   pnpm exec tsx src/audit/run-local-battery.ts <slug> [<slug> ...]
 *   pnpm exec tsx src/audit/run-local-battery.ts --all-unchecked   (sweeps every battery manifest
 *     that has at least one candidate missing a localVerdict)
 *
 * Requires JUDGE_SANDBOX_SNAPSHOT_ID (same as the real judge worker) to be set in the environment.
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "@oj/db";
import { judgeLocally } from "../local/judge.js";
import type { BatteryManifest } from "./battery-types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST_DIR = path.join(__dirname, "..", "..", "..", "..", "packages", "db", "audit", "battery-manifests");

function manifestPath(slug: string): string {
  return path.join(MANIFEST_DIR, `${slug}.json`);
}

async function loadManifest(slug: string): Promise<BatteryManifest> {
  const raw = await readFile(manifestPath(slug), "utf8");
  return JSON.parse(raw) as BatteryManifest;
}

async function saveManifest(m: BatteryManifest): Promise<void> {
  await writeFile(manifestPath(m.slug), JSON.stringify(m, null, 2) + "\n", "utf8");
}

async function allUncheckedSlugs(): Promise<string[]> {
  const files = await readdir(MANIFEST_DIR);
  const slugs: string[] = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    const m = JSON.parse(await readFile(path.join(MANIFEST_DIR, f), "utf8")) as BatteryManifest;
    if (m.candidates.some((c) => c.localVerdict === undefined)) slugs.push(m.slug);
  }
  return slugs;
}

async function runOne(slug: string): Promise<void> {
  const manifest = await loadManifest(slug);
  const problem = await prisma.problem.findUniqueOrThrow({
    where: { slug },
    include: { testCases: { orderBy: { ord: "asc" } } },
  });

  console.log(`\n=== ${slug} (uvaId=${problem.uvaId ?? "none"}, ${problem.testCases.length} local test cases) ===`);
  if (problem.testCases.length === 0) {
    console.log("  no local TestCase rows — this problem is currently judged remotely only, skipping Tier 1.");
    return;
  }

  for (const c of manifest.candidates) {
    const outcome = await judgeLocally(problem, problem.testCases, c.languageKey, c.sourceCode);
    c.localVerdict = outcome.status;
    c.localCheckedAt = new Date().toISOString();
    const flag = c.tag === "correct" ? (outcome.status === "AC" ? "" : "  <-- correct solution should AC!") : outcome.status === "AC" ? "  <-- WRONGLY PASSING LOCALLY" : "";
    console.log(`  [${c.tag}] ${c.label} -> ${outcome.status}${flag}`);
  }

  await saveManifest(manifest);

  const needsRemote = manifest.candidates.filter((c) => c.tag === "correct" || c.localVerdict === "AC");
  console.log(`  needs Tier 2 remote check: ${needsRemote.map((c) => c.tag).join(", ") || "(none)"}`);
}

async function main() {
  const args = process.argv.slice(2);
  const slugs = args[0] === "--all-unchecked" ? await allUncheckedSlugs() : args;
  if (slugs.length === 0) {
    console.error("Usage: tsx src/audit/run-local-battery.ts <slug> [<slug> ...]  |  --all-unchecked");
    process.exit(1);
  }
  for (const slug of slugs) {
    await runOne(slug);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
