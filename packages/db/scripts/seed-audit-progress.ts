/**
 * One-time seed for packages/db/audit/progress.json — the resumable cross-session tracker for the
 * full statement-fidelity audit (see the audit plan). Run once at the start of the project; never
 * re-run after that (it would wipe any in-progress status), which is why this deliberately refuses
 * to overwrite an existing file.
 */
import { PrismaClient } from "@prisma/client";
import { writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROGRESS_PATH = path.join(__dirname, "..", "audit", "progress.json");

interface ProgressRow {
  slug: string;
  uvaId: number;
  status: "unchecked" | "verified-ok" | "fixed-local" | "fixed-prod" | "needs-external-input" | "skip-no-source";
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

  const problems = await prisma.problem.findMany({
    where: { uvaId: { not: null } },
    select: { slug: true, uvaId: true },
    orderBy: { uvaId: "asc" },
  });

  const rows: ProgressRow[] = problems.map((p) => ({
    slug: p.slug,
    uvaId: p.uvaId!,
    status: "unchecked",
    issue: null,
    fixApplied: null,
    verifiedLocal: false,
    verifiedProd: false,
    checkedAt: null,
    notes: "",
  }));

  await writeFile(PROGRESS_PATH, JSON.stringify(rows, null, 2));
  console.log(`Seeded ${rows.length} rows to ${PROGRESS_PATH}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
