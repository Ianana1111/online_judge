/**
 * One-off: builds the "CPE 必考 49 題" collection (a curated list from
 * https://weilin1205.github.io/2022/07/28/UVa/CPEbasic/ — NOT scraped, the list itself is
 * hand-transcribed below since it's a static blog post, not a site worth writing a scraper for).
 *
 * Most of these 49 already exist as Problem rows (scraped from real CPE sittings). The handful
 * that don't are fetched directly from onlinejudge.org's own official PDF archive
 * (external/{num/100}/{num}.pdf) instead — same PDF-text-extraction pipeline as scrape-cpe.ts,
 * just a different source since these specific problems never appeared in a captured CPE sitting.
 * Safe to re-run: upserts by uvaId / collection slug.
 */
import { PrismaClient } from "@prisma/client";
import { PDFParse } from "pdf-parse";
import { cleanPdfStatementText, extractSampleFromPdfText } from "./formatStatement.js";
import { dacuToDifficulty, fetchUhuntDacu, fetchUhuntPidMap } from "./uhuntDifficulty.js";

const prisma = new PrismaClient();

const PROBLEMS: { uvaId: number; title: string }[] = [
  { uvaId: 10041, title: "Vito's Family" },
  { uvaId: 10055, title: "Hashmat the Brave Warrior" },
  { uvaId: 10035, title: "Primary Arithmetic" },
  { uvaId: 100, title: "The 3n + 1 Problem" },
  { uvaId: 10929, title: "You Can Say 11" },
  { uvaId: 10101, title: "Bangla Numbers" },
  { uvaId: 10420, title: "List of Conquests" },
  { uvaId: 10008, title: "What's Cryptanalysis?" },
  { uvaId: 10222, title: "Decode the Mad Man" },
  { uvaId: 11332, title: "Summing Digits" },
  { uvaId: 10252, title: "Common Permutation" },
  { uvaId: 490, title: "Rotating Sentences" },
  { uvaId: 272, title: "TeX Quotes" },
  { uvaId: 12019, title: "Doom's Day Algorithm" },
  { uvaId: 10038, title: "Jolly Jumpers" },
  { uvaId: 10056, title: "What is the Probability!!" },
  { uvaId: 10170, title: "The Hotel with Infinite Rooms" },
  { uvaId: 10268, title: "498-bis" },
  { uvaId: 10783, title: "Odd Sum" },
  { uvaId: 10812, title: "Beat the Spread!" },
  { uvaId: 11349, title: "Symmetric Matrix" },
  { uvaId: 11461, title: "Square Numbers" },
  { uvaId: 11063, title: "B2-Sequence" },
  { uvaId: 10071, title: "Back to High School Physics" },
  { uvaId: 10093, title: "An Easy Problem!" },
  { uvaId: 948, title: "Fibonaccimal Base" },
  { uvaId: 10019, title: "Funny Encryption Method" },
  { uvaId: 10931, title: "Parity" },
  { uvaId: 11005, title: "Cheapest Base" },
  { uvaId: 10050, title: "Hartals" },
  { uvaId: 10193, title: "All You Need Is Love!" },
  { uvaId: 10190, title: "Divide, But Not Quite Conquer!" },
  { uvaId: 10235, title: "Simply Emirp" },
  { uvaId: 10922, title: "2 the 9s" },
  { uvaId: 11417, title: "GCD" },
  { uvaId: 10908, title: "Largest Square" },
  { uvaId: 10221, title: "Satellites" },
  { uvaId: 10642, title: "Can You Solve It?" },
  { uvaId: 10242, title: "Fourth Point!!" },
  { uvaId: 10057, title: "A Mid-summer Night's Dream" },
  { uvaId: 10062, title: "Tell Me the Frequencies!" },
  { uvaId: 299, title: "Train Swapping" },
  { uvaId: 10226, title: "Hardwood Species" },
  { uvaId: 10189, title: "Minesweeper" },
  { uvaId: 10409, title: "Die Game" },
  { uvaId: 10415, title: "Eb Alto Saxophone Player" },
  { uvaId: 118, title: "Mutant Flatworld Explorers" },
  { uvaId: 11150, title: "Cola" },
  { uvaId: 11321, title: "Sort! Sort!! and Sort!!!" },
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "problem";
}

// Postgres text columns reject NUL bytes outright (occasionally emitted by pdf-parse for
// missing/embedded-font glyphs); strip them rather than let the whole upsert fail. Explicit
// \x00 here on purpose — a literal space in this regex is a real, easy-to-miss bug (it looks
// identical at a glance and silently strips every space out of the text instead).
function sanitizeForPostgres(s: string): string {
  return s.replace(/\x00/g, "");
}

async function fetchOfficialStatement(
  uvaId: number,
): Promise<{ statementMd: string; sourceUrl: string; sample: { input: string; output: string } | null }> {
  const folder = Math.floor(uvaId / 100);
  const pdfUrl = `https://onlinejudge.org/external/${folder}/${uvaId}.pdf`;
  const res = await fetch(pdfUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${pdfUrl}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sleep(300);

  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  const raw = result.text.trim();

  const body = cleanPdfStatementText(raw, uvaId);
  const sample = extractSampleFromPdfText(raw);
  return { statementMd: sanitizeForPostgres(body), sourceUrl: pdfUrl, sample };
}

async function main() {
  console.log("Fetching uHunt DACU data (for difficulty)...");
  const uhuntDacu = await fetchUhuntDacu();
  const uhuntPid = await fetchUhuntPidMap();

  const problemIds: string[] = [];

  for (const [i, { uvaId, title }] of PROBLEMS.entries()) {
    const existing = await prisma.problem.findUnique({ where: { uvaId } });
    if (existing) {
      console.log(`[${i + 1}/${PROBLEMS.length}] uva${uvaId}: already exists, reusing`);
      problemIds.push(existing.id);
      continue;
    }

    console.log(`[${i + 1}/${PROBLEMS.length}] uva${uvaId} (${title}): fetching from onlinejudge.org...`);
    try {
      const { statementMd, sourceUrl, sample } = await fetchOfficialStatement(uvaId);
      const dacu = uhuntDacu.get(uvaId);
      const difficulty = dacu !== undefined ? dacuToDifficulty(dacu) : 1;
      const slug = `uva-${uvaId}-${slugifyTitle(title)}`;

      const uvaPid = uhuntPid.get(uvaId);
      if (uvaPid === undefined) {
        console.warn(`  ! uva${uvaId}: no uHunt pid found — problem will be created without uvaPid (not remotely judgeable until backfilled)`);
      }

      const problem = await prisma.problem.create({
        data: {
          uvaId,
          uvaPid,
          slug,
          title: `${uvaId} - ${title}`,
          statementMd,
          sourceUrl,
          timeLimitMs: 2000,
          memoryLimitKb: 65536,
          difficulty,
          source: "UVA",
          checkerType: "IGNORE_TRAILING_WS",
        },
      });
      if (sample) {
        await prisma.sample.create({ data: { problemId: problem.id, ord: 1, input: sample.input, output: sample.output } });
      } else {
        console.warn(`  ! uva${uvaId}: could not extract a sample from the PDF text`);
      }
      problemIds.push(problem.id);
    } catch (err) {
      console.warn(`  ! uva${uvaId}: ${(err as Error).message} — skipping, won't be in the collection`);
    }
  }

  console.log("\nCreating collection...");
  const collection = await prisma.collection.upsert({
    where: { slug: "cpe-basic-49" },
    update: {},
    create: {
      slug: "cpe-basic-49",
      title: "CPE 必考 49 題",
      description: "CPE 考前必練的 49 道基礎題。",
    },
  });

  for (const [ord, problemId] of problemIds.entries()) {
    await prisma.collectionProblem.upsert({
      where: { collectionId_problemId: { collectionId: collection.id, problemId } },
      update: { ord },
      create: { collectionId: collection.id, problemId, ord },
    });
  }

  console.log(`\nDone. Collection "${collection.title}" has ${problemIds.length}/${PROBLEMS.length} problems.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
