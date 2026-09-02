/**
 * One-time seed for packages/db/audit/media-progress.json — the resumable cross-session tracker
 * for the image-restoration + centering pass (see the plan). Run once, after
 * audit-media-fidelity.ts has produced media-triage-report.json (used here to pre-populate each
 * row's signal flags so batches can be prioritized without re-reading the report every time).
 * Never re-run after that (it would wipe any in-progress status) — this deliberately refuses to
 * overwrite an existing file.
 */
import { readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIT_DIR = path.join(__dirname, "..", "audit");
const PROGRESS_PATH = path.join(AUDIT_DIR, "media-progress.json");
const TRIAGE_PATH = path.join(AUDIT_DIR, "media-triage-report.json");

type Status = "unchecked" | "no-media-needed" | "fixed-local" | "fixed-prod";

interface TriageRow {
  slug: string;
  uvaId: number;
  imageObjects: unknown[];
  hasVectorDiagramCandidate: boolean;
  centerCandidates: unknown[];
  subscriptCandidates: unknown[];
}

interface MediaProgressRow {
  slug: string;
  uvaId: number;
  hasImageCandidate: boolean;
  hasVectorCandidate: boolean;
  hasCenterCandidate: boolean;
  hasSubscriptCandidate: boolean;
  status: Status;
  imagesAdded: string[];
  centeredBlocksAdded: number;
  subscriptsFixed: number;
  issue: string | null;
  fixApplied: string | null;
  verifiedLocal: boolean;
  verifiedProd: boolean;
  checkedAt: string | null;
  notes: string;
}

async function main() {
  try {
    await access(PROGRESS_PATH);
    console.log(`${PROGRESS_PATH} already exists — refusing to overwrite. Delete it manually first if you really mean to reseed.`);
    return;
  } catch {
    /* doesn't exist yet, proceed */
  }

  const triage: TriageRow[] = JSON.parse(await readFile(TRIAGE_PATH, "utf-8"));

  const rows: MediaProgressRow[] = triage.map((t) => ({
    slug: t.slug,
    uvaId: t.uvaId,
    hasImageCandidate: t.imageObjects.length > 0,
    hasVectorCandidate: t.hasVectorDiagramCandidate,
    hasCenterCandidate: t.centerCandidates.length > 0,
    hasSubscriptCandidate: t.subscriptCandidates.length > 0,
    status: "unchecked",
    imagesAdded: [],
    centeredBlocksAdded: 0,
    subscriptsFixed: 0,
    issue: null,
    fixApplied: null,
    verifiedLocal: false,
    verifiedProd: false,
    checkedAt: null,
    notes: "",
  }));

  await writeFile(PROGRESS_PATH, JSON.stringify(rows, null, 2));
  const withSignal = rows.filter((r) => r.hasImageCandidate || r.hasVectorCandidate || r.hasCenterCandidate).length;
  console.log(`Seeded ${rows.length} rows to ${PROGRESS_PATH} (${withSignal} with at least one signal).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
