/**
 * One-time seed for the judge-rigor verification audit's two progress trackers (see the audit
 * plan). Splits problems by whether they have a real UVa problem to diff against:
 *   - judge-verify-progress.json: problems with both uvaId and uvaPid (differential-testable via
 *     the remote UVa bot — see apps/judge/src/audit/run-remote-check.ts).
 *   - judge-verify-progress-no-oracle.json: everything else (no external judge to confirm
 *     against; verified via local stress-testing only).
 * Run once; never re-run after that (would wipe in-progress status) — deliberately refuses to
 * overwrite an existing file, same guard as seed-audit-progress.ts.
 */
import { PrismaClient } from "@prisma/client";
import { writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WITH_ORACLE_PATH = path.join(__dirname, "..", "audit", "judge-verify-progress.json");
const NO_ORACLE_PATH = path.join(__dirname, "..", "audit", "judge-verify-progress-no-oracle.json");

async function existsAlready(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  for (const p of [WITH_ORACLE_PATH, NO_ORACLE_PATH]) {
    if (await existsAlready(p)) {
      console.log(`${p} already exists — refusing to overwrite. Delete it manually first if you really mean to reseed.`);
      return;
    }
  }

  const problems = await prisma.problem.findMany({
    select: { slug: true, uvaId: true, uvaPid: true, source: true, _count: { select: { testCases: true } } },
    orderBy: { slug: "asc" },
  });

  const withOracle = problems.filter((p) => p.uvaId !== null && p.uvaPid !== null);
  const noOracle = problems.filter((p) => p.uvaId === null || p.uvaPid === null);

  const withOracleRows = withOracle.map((p) => ({
    slug: p.slug,
    uvaId: p.uvaId,
    uvaPid: p.uvaPid,
    source: p.source,
    testCaseCount: p._count.testCases,
    status: "unchecked",
    divergences: [],
    submissionsUsedRemote: 0,
    lastSweptAt: null,
    notes: "",
  }));

  const noOracleRows = noOracle.map((p) => ({
    slug: p.slug,
    uvaId: p.uvaId,
    source: p.source,
    testCaseCount: p._count.testCases,
    status: "unchecked",
    divergences: [],
    lastSweptAt: null,
    notes: "",
  }));

  await writeFile(WITH_ORACLE_PATH, JSON.stringify(withOracleRows, null, 2) + "\n");
  await writeFile(NO_ORACLE_PATH, JSON.stringify(noOracleRows, null, 2) + "\n");
  console.log(`Seeded ${withOracleRows.length} rows to ${WITH_ORACLE_PATH}.`);
  console.log(`Seeded ${noOracleRows.length} rows to ${NO_ORACLE_PATH}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
