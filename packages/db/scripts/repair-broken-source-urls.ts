/**
 * One-off repair: 30 problems' sourceUrl (scraped from cpe.mcu.edu.tw's per-sitting archive) 404
 * — the PDF was removed from that server at some point after the sitting it was scraped from
 * (confirmed: even IDs referenced by still-listed old exam pages 404 the same way, so this isn't a
 * stale scrape, the file is just gone). This exact list of 30 was captured from the last full
 * refetch-statement-format.ts run's FAILED lines, rather than re-probing all 343 problems here —
 * that HEAD-based probe turned out to be extremely slow / prone to hanging against
 * cpe.mcu.edu.tw's old PHP server, which doesn't handle HEAD requests well.
 *
 * onlinejudge.org's own official archive (external/{uvaId/100}/{uvaId}.pdf) is the authoritative
 * source for every UVa problem regardless of CPE involvement, and was confirmed (via curl) to
 * serve all 30 of these fine — so re-point sourceUrl there and re-extract statementMd from it.
 */
import { PrismaClient } from "@prisma/client";
import { PDFParse } from "pdf-parse";
import { cleanPdfStatementText } from "./formatStatement.js";

const prisma = new PrismaClient();

const BROKEN_UVA_IDS = [
  10041, 573, 10229, 1292, 11518, 1371, 442, 941, 10672, 1193, 10110, 10093, 10161, 10443, 10539,
  12428, 340, 12882, 10107, 1118, 11576, 11175, 392, 11634, 12546, 12015, 11121, 10858, 10355, 580,
  // no sourceUrl at all (predates the sourceUrl column / was never backfilled)
  10055,
];

function sanitizeForPostgres(s: string): string {
  return s.replace(/\x00/g, "");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const FETCH_TIMEOUT_MS = 20_000;

async function main() {
  const problems = await prisma.problem.findMany({
    where: { uvaId: { in: BROKEN_UVA_IDS } },
    select: { id: true, slug: true, uvaId: true },
  });
  console.log(`Found ${problems.length}/${BROKEN_UVA_IDS.length} of the known-broken problems in this DB.`);

  let repaired = 0;
  let failed = 0;
  for (const [i, p] of problems.entries()) {
    const folder = Math.floor(p.uvaId! / 100);
    const fallbackUrl = `https://onlinejudge.org/external/${folder}/${p.uvaId}.pdf`;
    process.stdout.write(`[${i + 1}/${problems.length}] ${p.slug} -> ${fallbackUrl}... `);
    try {
      const res = await fetch(fallbackUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const parser = new PDFParse({ data: buf });
      const result = await parser.getText();
      const statementMd = sanitizeForPostgres(cleanPdfStatementText(result.text.trim(), p.uvaId!));
      await prisma.problem.update({ where: { id: p.id }, data: { sourceUrl: fallbackUrl, statementMd } });
      console.log("ok");
      repaired++;
    } catch (err) {
      console.log(`FAILED: ${(err as Error).message}`);
      failed++;
    }
    await sleep(200);
  }

  console.log(`\nDone. ${repaired}/${problems.length} repaired, ${failed} failed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
