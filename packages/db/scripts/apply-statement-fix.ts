/**
 * Generic fix-applier for the statement-fidelity audit — applies a batch of per-problem
 * statementMd/inputSpecMd/outputSpecMd/sourceUrl corrections (by slug) to whichever database
 * DATABASE_URL currently points at, and updates packages/db/audit/progress.json to match.
 *
 * Usage (run from packages/db):
 *   DATABASE_URL=<local-or-prod-url> npx tsx scripts/apply-statement-fix.ts <batch.json> <status>
 *
 * <batch.json> is an array of:
 *   { slug: string; statementMd?: string; inputSpecMd?: string; outputSpecMd?: string;
 *     sourceUrl?: string; issue?: string; fixApplied?: string }
 * A row with none of statementMd/inputSpecMd/outputSpecMd/sourceUrl set is treated as
 * "checked, no change needed" — only the progress.json row is updated.
 *
 * <status> is one of: verified-ok | fixed-local | fixed-prod | needs-external-input
 * (matches packages/db/audit/progress.json's status enum — see seed-audit-progress.ts).
 */
import { PrismaClient } from "@prisma/client";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROGRESS_PATH = path.join(__dirname, "..", "audit", "progress.json");

interface BatchItem {
  slug: string;
  statementMd?: string;
  inputSpecMd?: string;
  outputSpecMd?: string;
  sourceUrl?: string;
  issue?: string;
  fixApplied?: string;
}

type Status = "unchecked" | "verified-ok" | "fixed-local" | "fixed-prod" | "needs-external-input" | "skip-no-source";
const VALID_STATUSES: Status[] = ["verified-ok", "fixed-local", "fixed-prod", "needs-external-input"];

interface ProgressRow {
  slug: string;
  uvaId: number;
  status: Status;
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
    console.error("Usage: tsx apply-statement-fix.ts <batch.json> <verified-ok|fixed-local|fixed-prod|needs-external-input>");
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
      console.error(`WARNING: ${item.slug} not found in progress.json — skipping DB write and tracker update.`);
      continue;
    }

    const data: Record<string, string> = {};
    if (item.statementMd !== undefined) data.statementMd = item.statementMd;
    if (item.inputSpecMd !== undefined) data.inputSpecMd = item.inputSpecMd;
    if (item.outputSpecMd !== undefined) data.outputSpecMd = item.outputSpecMd;
    if (item.sourceUrl !== undefined) data.sourceUrl = item.sourceUrl;

    if (Object.keys(data).length > 0) {
      await prisma.problem.update({ where: { slug: item.slug }, data });
      dbUpdated++;
      console.log(`${item.slug}: updated ${Object.keys(data).join(", ")}`);
    } else {
      console.log(`${item.slug}: no content change, marking checked only`);
    }

    row.status = status as Status;
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
