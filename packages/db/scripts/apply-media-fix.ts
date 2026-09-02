/**
 * Generic fix-applier for the image-restoration + centering pass — applies a batch of per-problem
 * statementMd/inputSpecMd/outputSpecMd corrections (by slug) to whichever database DATABASE_URL
 * currently points at, and updates packages/db/audit/media-progress.json to match. Mirrors
 * apply-statement-fix.ts's interface exactly, just against the new progress file/status enum.
 *
 * Usage (run from packages/db):
 *   DATABASE_URL=<local-or-prod-url> npx tsx scripts/apply-media-fix.ts <batch.json> <status>
 *
 * <batch.json> is an array of:
 *   { slug: string; statementMd?: string; inputSpecMd?: string; outputSpecMd?: string;
 *     imagesAdded?: string[]; centeredBlocksAdded?: number; subscriptsFixed?: number;
 *     issue?: string; fixApplied?: string }
 * A row with none of statementMd/inputSpecMd/outputSpecMd set is treated as "checked, no media
 * work needed" — only the progress.json row is updated.
 *
 * <status> is one of: no-media-needed | fixed-local | fixed-prod
 * (matches packages/db/audit/media-progress.json's status enum — see seed-media-progress.ts).
 */
import { PrismaClient } from "@prisma/client";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROGRESS_PATH = path.join(__dirname, "..", "audit", "media-progress.json");

interface BatchItem {
  slug: string;
  statementMd?: string;
  inputSpecMd?: string;
  outputSpecMd?: string;
  imagesAdded?: string[];
  centeredBlocksAdded?: number;
  subscriptsFixed?: number;
  issue?: string;
  fixApplied?: string;
}

type Status = "unchecked" | "no-media-needed" | "fixed-local" | "fixed-prod";
const VALID_STATUSES: Status[] = ["no-media-needed", "fixed-local", "fixed-prod"];

interface ProgressRow {
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
  const [batchPath, status] = process.argv.slice(2);
  if (!batchPath || !status) {
    console.error("Usage: tsx apply-media-fix.ts <batch.json> <no-media-needed|fixed-local|fixed-prod>");
    process.exit(1);
  }
  if (!VALID_STATUSES.includes(status as Status)) {
    console.error(`Invalid status "${status}". Must be one of: ${VALID_STATUSES.join(", ")}`);
    process.exit(1);
  }

  const batch: BatchItem[] = JSON.parse(await readFile(path.resolve(batchPath), "utf-8"));
  const progress: ProgressRow[] = JSON.parse(await readFile(PROGRESS_PATH, "utf-8"));
  const progressBySlug = new Map(progress.map((r) => [r.slug, r]));

  let dbUpdated = 0;
  for (const item of batch) {
    const row = progressBySlug.get(item.slug);
    if (!row) {
      console.error(`WARNING: ${item.slug} not found in media-progress.json — skipping DB write and tracker update.`);
      continue;
    }

    const data: Record<string, string> = {};
    if (item.statementMd !== undefined) data.statementMd = item.statementMd;
    if (item.inputSpecMd !== undefined) data.inputSpecMd = item.inputSpecMd;
    if (item.outputSpecMd !== undefined) data.outputSpecMd = item.outputSpecMd;

    if (Object.keys(data).length > 0) {
      await prisma.problem.update({ where: { slug: item.slug }, data });
      dbUpdated++;
      console.log(`${item.slug}: updated ${Object.keys(data).join(", ")}`);
    } else {
      console.log(`${item.slug}: no content change, marking checked only`);
    }

    row.status = status as Status;
    row.imagesAdded = item.imagesAdded ?? row.imagesAdded;
    row.centeredBlocksAdded = item.centeredBlocksAdded ?? row.centeredBlocksAdded;
    row.subscriptsFixed = item.subscriptsFixed ?? row.subscriptsFixed;
    row.issue = item.issue ?? row.issue;
    row.fixApplied = item.fixApplied ?? row.fixApplied;
    row.checkedAt = new Date().toISOString();
    if (status === "fixed-local") row.verifiedLocal = true;
    if (status === "fixed-prod") {
      row.verifiedLocal = true;
      row.verifiedProd = true;
    }
  }

  await writeFile(PROGRESS_PATH, JSON.stringify(progress, null, 2));
  console.log(`\nDone. ${dbUpdated} problem(s) updated in DB, ${batch.length} progress.json row(s) updated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
