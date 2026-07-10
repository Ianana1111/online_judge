/**
 * One-off backfill: reformats already-scraped problem statements that are still wrapped in the
 * old ```text code-fence dump (see formatStatement.ts for why that rendered badly) — reprocesses
 * the already-stored extracted text in place, no need to re-fetch any PDFs.
 */
import { PrismaClient } from "@prisma/client";
import { cleanPdfStatementText } from "./formatStatement.js";

const prisma = new PrismaClient();

const FENCE_RE = /^(\*\*UVa (\d+) — .*?\*\*\n\n.*?\n\n)```text\n([\s\S]*?)\n```$/;

async function main() {
  const problems = await prisma.problem.findMany({
    where: { statementMd: { contains: "```text" } },
    select: { id: true, uvaId: true, statementMd: true, slug: true },
  });
  console.log(`Found ${problems.length} problems with fenced statements.`);

  let updated = 0;
  for (const p of problems) {
    const match = p.statementMd.match(FENCE_RE);
    if (!match || !p.uvaId) {
      console.warn(`  ! ${p.slug}: statement didn't match the expected fenced shape, skipping`);
      continue;
    }
    const [, header, , body] = match;
    const cleaned = header + cleanPdfStatementText(body, p.uvaId);
    await prisma.problem.update({ where: { id: p.id }, data: { statementMd: cleaned } });
    updated++;
  }
  console.log(`Done. Reformatted ${updated}/${problems.length} statements.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
