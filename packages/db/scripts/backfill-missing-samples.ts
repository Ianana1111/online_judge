/**
 * One-off backfill: some problems ended up with zero Sample rows — mostly the same 30 whose
 * cpe.mcu.edu.tw sourceUrl died (see repair-broken-source-urls.ts): their separate 測資A test-data
 * URL on that same server died alongside the PDF, so the original scrape-cpe.ts fetchSample() call
 * silently returned null. Now that sourceUrl points at onlinejudge.org's official PDF (which
 * usually embeds a "Sample Input"/"Sample Output" section in the text itself), re-extract from
 * there via the same extractSampleFromPdfText() used by scrape-cpe-basic-49.ts.
 */
import { PrismaClient } from "@prisma/client";
import { PDFParse } from "pdf-parse";
import { extractSampleFromPdfText } from "./formatStatement.js";

const prisma = new PrismaClient();

function sanitizeForPostgres(s: string): string {
  return s.replace(/\x00/g, "");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const FETCH_TIMEOUT_MS = 20_000;

async function main() {
  const problems = await prisma.problem.findMany({
    where: { samples: { none: {} }, sourceUrl: { not: null } },
    select: { id: true, slug: true, sourceUrl: true },
  });
  console.log(`Found ${problems.length} problems with no samples.`);

  let added = 0;
  let stillMissing = 0;
  for (const [i, p] of problems.entries()) {
    process.stdout.write(`[${i + 1}/${problems.length}] ${p.slug}... `);
    try {
      const res = await fetch(p.sourceUrl!, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const parser = new PDFParse({ data: buf });
      const result = await parser.getText();
      const sample = extractSampleFromPdfText(result.text.trim());
      if (!sample) {
        console.log("no Sample Input/Output section found in PDF text, skipping");
        stillMissing++;
        await sleep(200);
        continue;
      }
      await prisma.sample.create({
        data: {
          problemId: p.id,
          ord: 1,
          input: sanitizeForPostgres(sample.input),
          output: sanitizeForPostgres(sample.output),
        },
      });
      console.log("ok");
      added++;
    } catch (err) {
      console.log(`FAILED: ${(err as Error).message}`);
      stillMissing++;
    }
    await sleep(200);
  }

  console.log(`\nDone. ${added}/${problems.length} samples added, ${stillMissing} still missing.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
