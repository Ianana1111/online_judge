/**
 * One-off backfill: re-runs the PDF → statementMd extraction for every problem that already has a
 * sourceUrl, using the current cleanPdfStatementText (which now also detects numbered lists and
 * rejoins their PDF-wrapped continuation lines — see formatStatement.ts). Re-processing the
 * already-cleaned statementMd in place isn't safe (the original line-wrap information a numbered
 * list needs is gone once it's been joined into paragraphs), so this re-fetches each PDF fresh and
 * re-extracts from raw text instead, exactly like the original scrape did.
 */
import { PrismaClient } from "@prisma/client";
import { PDFParse } from "pdf-parse";
import { cleanPdfStatementText } from "./formatStatement.js";

const prisma = new PrismaClient();

function sanitizeForPostgres(s: string): string {
  return s.replace(/\x00/g, "");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const problems = await prisma.problem.findMany({
    where: { sourceUrl: { not: null }, uvaId: { not: null } },
    select: { id: true, slug: true, uvaId: true, sourceUrl: true },
  });
  console.log(`Found ${problems.length} problems with a sourceUrl to reprocess.`);

  let updated = 0;
  let failed = 0;
  for (const [i, p] of problems.entries()) {
    process.stdout.write(`[${i + 1}/${problems.length}] ${p.slug}... `);
    try {
      const res = await fetch(p.sourceUrl!);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const parser = new PDFParse({ data: buf });
      const result = await parser.getText();
      const statementMd = sanitizeForPostgres(cleanPdfStatementText(result.text.trim(), p.uvaId!));
      await prisma.problem.update({ where: { id: p.id }, data: { statementMd } });
      console.log("ok");
      updated++;
    } catch (err) {
      console.log(`FAILED: ${(err as Error).message}`);
      failed++;
    }
    await sleep(200);
  }
  console.log(`\nDone. Updated ${updated}/${problems.length} (${failed} failed).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
