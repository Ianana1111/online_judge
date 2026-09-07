/**
 * Tier 2 of the judge-rigor verification audit (see the audit plan): submits only the candidates
 * that actually need confirming against the real UVa judge — the `correct` reference (catches
 * "local too strict") and any deliberately-flawed candidate that Tier 1 already found wrongly
 * passing locally (catches "local too weak") — via judgeViaUva(), the exact same function the
 * real remote judge queue uses.
 *
 * MUST be run as a single long-lived process for the whole batch in one invocation (not re-spawned
 * per problem in a shell loop): judgeViaUva's submit-gap throttle and cached login session are
 * both module-level state that resets to nothing the instant the process exits, which would
 * silently defeat the throttle and hammer UVa with no minimum gap between problems.
 *
 * Run this Tier 2 pass only AFTER Tier 1 (run-local-battery.ts) has already run for these slugs —
 * a candidate with no localVerdict yet is skipped with a warning rather than guessed at.
 *
 * Usage (from apps/judge):
 *   UVA_BOT_USERNAME=... UVA_BOT_PASSWORD=... pnpm exec tsx src/audit/run-remote-check.ts <slug> [<slug> ...]
 *
 * Budget: ~1.5 remote submissions/problem on average (see the audit plan) — keep a single
 * invocation's slug list to ~15-20 problems (roughly one judge-verify-batch-NN.json) so a session
 * stays in the ~20-35 minute range this was budgeted for, rather than running unattended for hours.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "@oj/db";
import { judgeViaUva } from "../remote/uva.js";
import type { BatteryManifest, Candidate } from "./battery-types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_AUDIT_DIR = path.join(__dirname, "..", "..", "..", "..", "packages", "db", "audit");
const MANIFEST_DIR = path.join(DB_AUDIT_DIR, "battery-manifests");
const PROGRESS_PATH = path.join(DB_AUDIT_DIR, "judge-verify-progress.json");

interface Divergence {
  candidateTag: string;
  localVerdict: string;
  remoteVerdict: string;
  direction: "local-too-weak" | "local-too-strict";
  diagnosedCause: string | null;
  fixApplied: string | null;
  fixedAt: string | null;
  reVerified: boolean;
}

interface ProgressRow {
  slug: string;
  uvaId: number | null;
  uvaPid: number | null;
  source: string;
  testCaseCount: number;
  status: string;
  divergences: Divergence[];
  submissionsUsedRemote: number;
  lastSweptAt: string | null;
  notes: string;
}

function manifestPath(slug: string): string {
  return path.join(MANIFEST_DIR, `${slug}.json`);
}

async function loadManifest(slug: string): Promise<BatteryManifest> {
  return JSON.parse(await readFile(manifestPath(slug), "utf8")) as BatteryManifest;
}

async function saveManifest(m: BatteryManifest): Promise<void> {
  await writeFile(manifestPath(m.slug), JSON.stringify(m, null, 2) + "\n", "utf8");
}

async function loadProgress(): Promise<ProgressRow[]> {
  return JSON.parse(await readFile(PROGRESS_PATH, "utf8")) as ProgressRow[];
}

async function saveProgress(rows: ProgressRow[]): Promise<void> {
  await writeFile(PROGRESS_PATH, JSON.stringify(rows, null, 2) + "\n", "utf8");
}

/** A candidate needs a remote check iff Tier 1 already ran it AND (it's the reference solution, or
 * it wrongly passed locally) AND it hasn't already been remote-checked (idempotent re-runs).
 * `hasNoLocalData` bypasses the localVerdict requirement entirely: a problem with zero TestCase
 * rows has nothing for Tier 1 to run against, so every candidate needs a real UVa verdict — that
 * verdict set is also what eventually seeds this problem's first-ever local TestCase rows (see
 * the plan's remediation loop), not just a rigor check. */
function selectForRemote(candidates: Candidate[], hasNoLocalData: boolean): Candidate[] {
  return candidates.filter((c) => {
    if (c.remoteVerdict !== undefined) return false;
    if (hasNoLocalData) return true;
    if (c.localVerdict === undefined) return false;
    return c.tag === "correct" || c.localVerdict === "AC";
  });
}

async function runOne(slug: string, progress: ProgressRow[]): Promise<void> {
  const manifest = await loadManifest(slug);
  const problem = await prisma.problem.findUniqueOrThrow({ where: { slug }, include: { _count: { select: { testCases: true } } } });
  const row = progress.find((r) => r.slug === slug);
  if (!row) {
    console.log(`  no judge-verify-progress.json row for ${slug} — skipping. Seed it first via seed-judge-verify-progress.ts.`);
    return;
  }

  const hasNoLocalData = problem._count.testCases === 0;
  const toCheck = selectForRemote(manifest.candidates, hasNoLocalData);
  console.log(`\n=== ${slug} (uvaId=${problem.uvaId}) — ${toCheck.length} candidate(s) to remote-check ===`);
  if (toCheck.length === 0) {
    console.log("  nothing needs a remote check (either already checked, or Tier 1 hasn't run yet).");
    return;
  }

  for (const c of toCheck) {
    const outcome = await judgeViaUva(problem, c.languageKey, c.sourceCode);
    c.remoteVerdict = outcome.status;
    c.remoteCheckedAt = new Date().toISOString();
    row.submissionsUsedRemote += 1;
    console.log(
      `  [${c.tag}] ${c.label} -> local=${c.localVerdict ?? "(no local data)"} remote=${outcome.status}` +
        (outcome.compileError ? ` (${outcome.compileError})` : ""),
    );

    if (hasNoLocalData) {
      // No Tier 1 verdict exists to diverge from — the remote verdict here isn't confirming a
      // local weakness, it's the ONLY verdict this candidate has, and (once all candidates in
      // this batch have run) becomes the raw material for seeding this problem's first-ever
      // local TestCase rows. Just flag anything that looks wrong for manual attention.
      if (c.tag === "correct" && outcome.status !== "AC") {
        row.notes += `${row.notes ? " " : ""}correct candidate got ${outcome.status} on real UVa — reference solution or uvaPid may be wrong, investigate before seeding test data from it.`;
      } else if (c.tag !== "correct" && outcome.status === "AC") {
        row.notes += `${row.notes ? " " : ""}flawed candidate "${c.tag}" was accepted by real UVa too — oracle-weak, not usable as a distinguishing test case.`;
      }
      continue;
    }

    if (c.tag === "correct" && outcome.status !== "AC") {
      row.divergences.push({
        candidateTag: c.tag,
        localVerdict: c.localVerdict!,
        remoteVerdict: outcome.status,
        direction: "local-too-strict",
        diagnosedCause: null,
        fixApplied: null,
        fixedAt: null,
        reVerified: false,
      });
    } else if (c.tag !== "correct" && c.localVerdict === "AC") {
      if (outcome.status === "AC") {
        console.log(`    (UVa also accepts this — oracle-weak case, not a local-weakness finding by itself)`);
      } else {
        row.divergences.push({
          candidateTag: c.tag,
          localVerdict: c.localVerdict!,
          remoteVerdict: outcome.status,
          direction: "local-too-weak",
          diagnosedCause: null,
          fixApplied: null,
          fixedAt: null,
          reVerified: false,
        });
      }
    }
  }

  await saveManifest(manifest);
  row.lastSweptAt = new Date().toISOString();
  if (hasNoLocalData) {
    row.status = "needs-testcase-seed";
  } else {
    row.status = row.divergences.some((d) => !d.reVerified) ? "divergence-found" : "verified-match";
  }
  await saveProgress(progress);
}

async function main() {
  const slugs = process.argv.slice(2);
  if (slugs.length === 0) {
    console.error("Usage: UVA_BOT_USERNAME=... UVA_BOT_PASSWORD=... tsx src/audit/run-remote-check.ts <slug> [<slug> ...]");
    process.exit(1);
  }
  const progress = await loadProgress();
  for (const slug of slugs) {
    await runOne(slug, progress);
  }
  console.log(`\nDone. ${slugs.length} problem(s) processed this session.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
