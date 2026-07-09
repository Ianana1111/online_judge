/**
 * One-off scraper: pulls every past CPE (大學程式能力檢定) sitting from cpe.mcu.edu.tw's public
 * test_data archive, along with each problem's real test data (the site publishes actual
 * input/output pairs per UVa problem id, unlike UVa itself). Populates:
 *   - one Problem per unique UVa id referenced across all sittings (source=CPE, real test data)
 *   - one Contest (kind=CPE) per exam date, with ContestProblem rows labeled A..G
 * Safe to re-run: everything is upserted by uvaId / contest slug.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { PDFParse } from "pdf-parse";
import { TestDataStore } from "@oj/shared";

const prisma = new PrismaClient();
const store = new TestDataStore();

const BASE = "https://cpe.mcu.edu.tw/cpe";
const REQUEST_DELAY_MS = 200;
const LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  await sleep(REQUEST_DELAY_MS);
  return res.text();
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const arrayBuf = await res.arrayBuffer();
  await sleep(REQUEST_DELAY_MS);
  return Buffer.from(arrayBuf);
}

function sanitizeForPostgres(s: string): string {
  // Postgres text columns reject NUL bytes outright (occasionally emitted by pdf-parse for
  // missing/embedded-font glyphs); strip them rather than let the whole upsert fail.
  return s.replace(/\u0000/g, "");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
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

interface ExamRow {
  ord: number; // P-number from the site (1-indexed)
  uvaId: number;
  title: string;
  pdfUrl: string;
  testAUrl: string;
  testBUrl: string;
  // Only present on newer sittings (2025-09-30 onward), which publish a reference SOLUTION
  // instead of pre-computed expected output — see fetchTestData().
  codeUrl?: string;
  // Real-world CPE exam stats for this problem in this specific sitting, from the per-problem
  // stats table (繳交次數/作答人數/答對人數) — undefined if that row's cells didn't parse cleanly.
  submissions?: number;
  attempted?: number;
  correct?: number;
}

interface ExamPage {
  rows: ExamRow[];
  avgCorrectCount: number | null;
  totalCandidates: number | null;
}

async function fetchExamDates(): Promise<string[]> {
  const html = await fetchText(`${BASE}/test_data/`);
  const dates = new Set<string>();
  for (const m of html.matchAll(/test_data\/(\d{4}-\d{2}-\d{2})/g)) dates.add(m[1]);
  return [...dates].sort();
}

async function fetchExamRows(date: string): Promise<ExamPage> {
  const html = await fetchText(`${BASE}/test_data/${date}`);
  const rows: ExamRow[] = [];

  // The site has used at least two different URL schemes for problem assets over the years:
  //   old (2013 - 2025-05): /cpe/problemPdf/{uvaId}.pdf + /cpe/problemPdf/testData/uva{uvaId}a.php
  //   new (2025-09 onward): /cpe/problems/CPE{ymd}/CPE{ymd}-P{n}.uva{uvaId}.pdf + ...tda.txt/tdb.txt
  // Extracting the actual href (rather than reconstructing a URL from a template) works for both
  // without needing to special-case which scheme a given sitting uses.
  //
  // Each problem's <tr> also carries its per-problem stats table (6 `<td><center>` cells: 繳交
  // 次數, 作答人數, 答對人數, then three % rate columns we recompute ourselves instead of storing) —
  // match row-by-row (not a single global regex over the whole page) so each stat block stays
  // paired with the correct problem, since the surrounding HTML is littered with unrelated
  // leftover-template comments from other dates.
  const rowRe = /<tr>([\s\S]*?)<\/tr>/g;
  const idRe = /href=([^\s>]+\.pdf)>P(\d+)-uva(\d+)\s*[:：]\s*([^<]+?)<\/a>/;
  const codeRe = /href=([^\s>]+\.code\.txt)>code<\/a>/;
  const testDataRe = /href=([^\s>]+)>測資A<\/a>[\s\S]*?href=([^\s>]+)>測資B<\/a>/;
  const statRe = /<td><center>([^<]*)<\/center><\/td>/g;

  for (const rowMatch of html.matchAll(rowRe)) {
    const block = rowMatch[1];
    const idMatch = block.match(idRe);
    const testDataMatch = block.match(testDataRe);
    if (!idMatch || !testDataMatch) continue;

    const codeMatch = block.match(codeRe);
    const stats = [...block.matchAll(statRe)].map((m) => m[1].trim().replace(/,/g, ""));
    const [submissions, attempted, correct] = stats.map((v) => (v ? parseInt(v, 10) : undefined));

    rows.push({
      uvaId: parseInt(idMatch[3], 10),
      ord: parseInt(idMatch[2], 10),
      title: decodeEntities(idMatch[4].trim()),
      pdfUrl: new URL(idMatch[1], `${BASE}/`).toString(),
      testAUrl: new URL(testDataMatch[1], `${BASE}/`).toString(),
      testBUrl: new URL(testDataMatch[2], `${BASE}/`).toString(),
      codeUrl: codeMatch ? new URL(codeMatch[1], `${BASE}/`).toString() : undefined,
      submissions,
      attempted,
      correct,
    });
  }

  const avgMatch = html.match(/平均答對題數[：:]\s*([\d.]+)/);
  const totalMatch = html.match(/考生總人數\s*[(（](\d+)[)）]/);
  return {
    rows: rows.sort((a, b) => a.ord - b.ord),
    avgCorrectCount: avgMatch ? parseFloat(avgMatch[1]) : null,
    totalCandidates: totalMatch ? parseInt(totalMatch[1], 10) : null,
  };
}

function extractPreBlocks(html: string): string[] {
  return [...html.matchAll(/<pre>([\s\S]*?)<\/pre>/g)].map((m) => decodeEntities(m[1]).replace(/^\n/, ""));
}

/** Compiles a C++ reference solution and returns its stdout for a given stdin, in a scratch
 * directory that's cleaned up before returning. Used only for newer sittings that publish a
 * reference solution instead of pre-computed expected output (see fetchTestData below). */
function runReferenceSolution(source: string, input: string): string {
  const dir = mkdtempSync(join(tmpdir(), "cpe-ref-"));
  try {
    const srcPath = join(dir, "ref.cpp");
    const binPath = join(dir, "ref");
    writeFileSync(srcPath, source);
    const compile = spawnSync("g++", ["-O2", "-std=c++17", "-o", binPath, srcPath], { timeout: 15_000 });
    if (compile.status !== 0) {
      throw new Error(`reference solution failed to compile: ${compile.stderr?.toString().slice(0, 500)}`);
    }
    const run = spawnSync(binPath, [], { input, timeout: 10_000, maxBuffer: 20 * 1024 * 1024 });
    if (run.status !== 0) {
      throw new Error(`reference solution runtime error (exit ${run.status}): ${run.stderr?.toString().slice(0, 300)}`);
    }
    return run.stdout.toString();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function fetchTestData(row: ExamRow): Promise<{ input: string; output: string }[]> {
  const cases: { input: string; output: string }[] = [];

  if (row.testAUrl.endsWith(".php")) {
    // Old scheme: each "測資X" page is a rendered HTML page with two <pre> blocks (Input, Output).
    for (const url of [row.testAUrl, row.testBUrl]) {
      const html = await fetchText(url);
      const [input, output] = extractPreBlocks(html);
      if (input === undefined || output === undefined) {
        console.warn(`  ! ${url}: could not find both Input/Output <pre> blocks, skipping`);
        continue;
      }
      cases.push({
        input: sanitizeForPostgres(input.replace(/\s+$/, "\n")),
        output: sanitizeForPostgres(output.replace(/\s+$/, "\n")),
      });
    }
    return cases;
  }

  // New scheme: "測資X" is a plain-text INPUT file only (no expected output published) — but a
  // reference solution is published alongside it, so compile that once and run it against each
  // input file ourselves to produce the expected output.
  if (!row.codeUrl) {
    console.warn(`  ! uva${row.uvaId}: new-format test data with no reference solution link, skipping`);
    return cases;
  }
  const source = await fetchText(row.codeUrl);
  for (const url of [row.testAUrl, row.testBUrl]) {
    const input = await fetchText(url);
    try {
      const output = runReferenceSolution(source, input);
      cases.push({
        input: sanitizeForPostgres(input.replace(/\s+$/, "\n")),
        output: sanitizeForPostgres(output.replace(/\s+$/, "\n")),
      });
    } catch (err) {
      console.warn(`  ! uva${row.uvaId}: ${(err as Error).message}`);
    }
  }
  return cases;
}

async function fetchStatementMd(uvaId: number, title: string, pdfUrl: string): Promise<string> {
  let bodyText = "*(statement text could not be extracted from the original PDF — see link above)*";
  try {
    const buf = await fetchBuffer(pdfUrl);
    const parser = new PDFParse({ data: buf });
    const result = await parser.getText();
    bodyText = "```text\n" + result.text.trim() + "\n```";
  } catch (err) {
    console.warn(`  ! uva${uvaId}: PDF text extraction failed: ${(err as Error).message}`);
  }
  return sanitizeForPostgres(
    `**UVa ${uvaId} — ${title}**\n\nSourced from a past CPE (大學程式能力檢定) sitting. [原始 PDF](${pdfUrl})\n\n${bodyText}`,
  );
}

async function main() {
  await store.ensureBucket();

  console.log("Fetching exam date list...");
  let dates = await fetchExamDates();
  console.log(`Found ${dates.length} exam sittings: ${dates[0]} .. ${dates[dates.length - 1]}`);
  const limit = process.env.CPE_SCRAPE_LIMIT ? parseInt(process.env.CPE_SCRAPE_LIMIT, 10) : undefined;
  if (limit) dates = dates.slice(-limit);

  const examRows = new Map<string, ExamRow[]>();
  const examAvgCorrect = new Map<string, number | null>();
  const examTotalCandidates = new Map<string, number | null>();
  const uniqueProblems = new Map<number, ExamRow>(); // uvaId -> first-seen row (title + asset URLs)

  for (const date of dates) {
    const { rows, avgCorrectCount, totalCandidates } = await fetchExamRows(date);
    examRows.set(date, rows);
    examAvgCorrect.set(date, avgCorrectCount);
    examTotalCandidates.set(date, totalCandidates);
    for (const row of rows) {
      if (!uniqueProblems.has(row.uvaId)) uniqueProblems.set(row.uvaId, row);
    }
    console.log(
      `  ${date}: ${rows.length} problems, avgCorrect=${avgCorrectCount ?? "n/a"}, candidates=${totalCandidates ?? "n/a"}`,
    );
  }
  console.log(`\n${uniqueProblems.size} unique UVa problems across all sittings.\n`);

  const problemIdByUva = new Map<number, string>();
  let done = 0;
  for (const [uvaId, firstRow] of uniqueProblems) {
    done++;
    const title = firstRow.title;
    const slug = `uva-${uvaId}-${slugifyTitle(title)}`;
    const displayTitle = `${uvaId} - ${title}`;
    console.log(`[${done}/${uniqueProblems.size}] uva ${uvaId} (${title})`);

    const existing = await prisma.problem.findUnique({
      where: { uvaId },
      include: { _count: { select: { testCases: true } } },
    });
    if (existing && existing._count.testCases > 0) {
      console.log(`  already scraped (${existing._count.testCases} test cases), skipping`);
      problemIdByUva.set(uvaId, existing.id);
      continue;
    }

    let testCases: { input: string; output: string }[] = [];
    try {
      testCases = await fetchTestData(firstRow);
    } catch (err) {
      console.warn(`  ! uva${uvaId}: test data fetch failed, skipping test cases: ${(err as Error).message}`);
    }

    const statementMd = existing?.statementMd ?? (await fetchStatementMd(uvaId, title, firstRow.pdfUrl));

    const problem = await prisma.problem.upsert({
      where: { uvaId },
      update: { title: displayTitle },
      create: {
        uvaId,
        slug,
        title: displayTitle,
        statementMd,
        timeLimitMs: 2000,
        memoryLimitKb: 65536,
        difficulty: 1,
        source: "CPE",
        checkerType: "IGNORE_TRAILING_WS",
        isRemoteOnly: testCases.length === 0,
      },
    });
    problemIdByUva.set(uvaId, problem.id);

    if (testCases.length > 0) {
      await prisma.sample.deleteMany({ where: { problemId: problem.id } });
      await prisma.testCase.deleteMany({ where: { problemId: problem.id } });
      for (let i = 0; i < testCases.length; i++) {
        const ord = i + 1;
        const ordStr = String(ord).padStart(2, "0");
        const inputKey = `${slug}/${ordStr}.in`;
        const answerKey = `${slug}/${ordStr}.out`;
        await store.putText(inputKey, testCases[i].input);
        await store.putText(answerKey, testCases[i].output);
        await prisma.testCase.create({
          data: { problemId: problem.id, ord, inputKey, answerKey, isSample: ord === 1 },
        });
        if (ord === 1) {
          await prisma.sample.create({
            data: { problemId: problem.id, ord, input: testCases[i].input, output: testCases[i].output },
          });
        }
      }
    }
  }

  console.log("\nCreating CPE contests...");
  for (const [date, rows] of examRows) {
    if (rows.length === 0) continue;
    const slug = `cpe-${date}`;
    const avgCorrectCount = examAvgCorrect.get(date) ?? null;
    const totalCandidates = examTotalCandidates.get(date) ?? null;
    const contest = await prisma.contest.upsert({
      where: { slug },
      update: { avgCorrectCount, totalCandidates },
      create: {
        title: `CPE ${date}`,
        slug,
        kind: "CPE",
        durationMin: 180,
        freezeMin: 60,
        penaltyMin: 20,
        scoring: "ICPC",
        isPublic: true,
        avgCorrectCount,
        totalCandidates,
      },
    });
    let ord = 0;
    for (const row of rows) {
      const problemId = problemIdByUva.get(row.uvaId);
      if (!problemId) continue;
      const label = LABELS[ord] ?? String(ord);
      const stats = { submissions: row.submissions, attempted: row.attempted, correct: row.correct };
      await prisma.contestProblem.upsert({
        where: { contestId_problemId: { contestId: contest.id, problemId } },
        update: { label, ord, ...stats },
        create: { contestId: contest.id, problemId, label, ord, ...stats },
      });
      ord++;
    }
    console.log(`  ${slug}: ${ord} problems`);
  }

  console.log(`\nDone. ${uniqueProblems.size} problems, ${examRows.size} CPE contests.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
