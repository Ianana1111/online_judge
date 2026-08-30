/**
 * Triage pass for the full statement-fidelity audit (430 problems vs. their original PDFs) — this
 * does NOT fix anything. It fetches each problem's source PDF (cached locally so repeat runs
 * during the manual fix pass don't re-hit onlinejudge.org/cpe.mcu.edu.tw), extracts
 * layout-preserving ground-truth text via `pdftotext -layout` (which keeps column alignment far
 * better than the pdf-parse extraction the original import used — see formatStatement.ts's own
 * comments on why that mattered), and flags likely structural drift in the stored statementMd:
 * missing paragraph breaks and flattened tables/grids, the two bug classes already confirmed live
 * (uva-13257-license-plates, uva-10050-hartals).
 *
 * Output is a PRIORITIZATION aid only (packages/db/audit/triage-report.json), not a filter — every
 * problem still gets manually checked regardless of its score (see packages/db/audit/progress.json
 * and the audit plan). A score of 0 means "check quickly, expect to confirm OK," not "skip."
 *
 * Run from packages/db: `pnpm exec tsx scripts/audit-statement-fidelity.ts`
 */
import { PrismaClient } from "@prisma/client";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, mkdir, access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const prisma = new PrismaClient();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIT_DIR = path.join(__dirname, "..", "audit");
const CACHE_DIR = path.join(AUDIT_DIR, "pdf-cache");
const FETCH_TIMEOUT_MS = 20_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function onlinejudgeUrl(uvaId: number): string {
  return `https://onlinejudge.org/external/${Math.floor(uvaId / 100)}/${uvaId}.pdf`;
}

/** Returns the local cached PDF path, fetching (and caching) it first if needed. Tries sourceUrl
 * first, then the reconstructed onlinejudge.org URL as a fallback (covers both the 18 problems
 * with no sourceUrl at all, and the handful of known-dead cpe.mcu.edu.tw links). */
async function ensurePdfCached(uvaId: number, sourceUrl: string | null): Promise<string | null> {
  const cachePath = path.join(CACHE_DIR, `${uvaId}.pdf`);
  try {
    await access(cachePath);
    return cachePath;
  } catch {
    /* not cached yet */
  }

  const candidates = [sourceUrl, onlinejudgeUrl(uvaId)].filter((u): u is string => !!u);
  for (const url of candidates) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 100) continue; // too small to be a real PDF
      await writeFile(cachePath, buf);
      return cachePath;
    } catch {
      continue;
    }
  }
  return null;
}

async function pdfToLayoutText(pdfPath: string): Promise<string> {
  const { stdout } = await execFileAsync("pdftotext", ["-layout", pdfPath, "-"]);
  return stdout;
}

/** Flags statements with very few blank-line paragraph breaks relative to their prose line count
 * — StatementRenderer never treats a lone "\n" as a break, so a statement with many consecutive
 * non-blank content lines and few blank lines is exactly the uva-13257 "wall of text" shape. */
function runOnParagraphSignal(statementMd: string): number {
  const lines = statementMd.split("\n");
  let contentLines = 0;
  let consecutivePairs = 0;
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (line === "") continue;
    if (line.startsWith("#") || line.startsWith("|") || /^\d+\.\s/.test(line) || line.startsWith("-")) continue;
    contentLines++;
    const next = (lines[i + 1] ?? "").trim();
    if (next !== "" && !next.startsWith("#") && !next.startsWith("|") && !next.startsWith("```")) {
      consecutivePairs++;
    }
  }
  if (contentLines < 4) return 0;
  const ratio = consecutivePairs / contentLines;
  return ratio > 0.7 ? Math.round(ratio * 10) : 0;
}

/** Flags PDF regions that look like a multi-column grid/table (>=3 consecutive lines each with
 * multiple 2+-space gaps, the classic layout fingerprint of aligned columns) that have no
 * corresponding fenced code block or GFM table anywhere in the stored statementMd. */
function flattenedGridSignal(pdfLayoutText: string, statementMd: string): number {
  const pdfLines = pdfLayoutText.split("\n");
  let maxRun = 0;
  let run = 0;
  for (const line of pdfLines) {
    const gaps = (line.match(/ {2,}/g) ?? []).length;
    if (gaps >= 3 && line.trim().length > 0) {
      run++;
      maxRun = Math.max(maxRun, run);
    } else {
      run = 0;
    }
  }
  if (maxRun < 3) return 0;
  const hasFence = /```/.test(statementMd);
  const hasTable = /^\s*\|.*\|\s*$/m.test(statementMd);
  return hasFence || hasTable ? 0 : Math.min(maxRun, 10);
}

/** Cheap sanity check for truncated/garbage extraction — unrelated to the two known bug classes
 * but free to compute. Sample Input/Output is deliberately dropped from statementMd (shown
 * separately), so PDF text is expected to run longer; only a very low ratio is suspicious. */
function lengthDriftSignal(pdfLayoutText: string, statementMd: string): number {
  const sampleIdx = pdfLayoutText.search(/Sample Input/i);
  const pdfBody = sampleIdx > 0 ? pdfLayoutText.slice(0, sampleIdx) : pdfLayoutText;
  const pdfWords = pdfBody.split(/\s+/).filter(Boolean).length;
  const mdWords = statementMd.split(/\s+/).filter(Boolean).length;
  if (pdfWords < 20) return 0;
  const ratio = mdWords / pdfWords;
  return ratio < 0.5 ? Math.round((0.5 - ratio) * 20) : 0;
}

interface TriageRow {
  slug: string;
  uvaId: number;
  sourceUrl: string | null;
  hasRunOnSignal: number;
  hasGridSignal: number;
  hasLengthDriftSignal: number;
  score: number;
  fetchError: string | null;
}

async function main() {
  await mkdir(CACHE_DIR, { recursive: true });

  const problems = await prisma.problem.findMany({
    where: { uvaId: { not: null } },
    select: { slug: true, uvaId: true, sourceUrl: true, statementMd: true },
    orderBy: { uvaId: "asc" },
  });
  console.log(`Auditing ${problems.length} problems with a uvaId (16 no-source GPE problems excluded).`);

  const rows: TriageRow[] = [];
  for (const [i, p] of problems.entries()) {
    process.stdout.write(`[${i + 1}/${problems.length}] ${p.slug}... `);
    const uvaId = p.uvaId!;
    try {
      const cachedPath = await ensurePdfCached(uvaId, p.sourceUrl);
      if (!cachedPath) {
        rows.push({
          slug: p.slug,
          uvaId,
          sourceUrl: p.sourceUrl,
          hasRunOnSignal: 0,
          hasGridSignal: 0,
          hasLengthDriftSignal: 0,
          score: 0,
          fetchError: "could not fetch PDF from sourceUrl or onlinejudge.org fallback",
        });
        console.log("FETCH FAILED");
        await sleep(200);
        continue;
      }
      const layoutText = await pdfToLayoutText(cachedPath);
      const runOn = runOnParagraphSignal(p.statementMd);
      const grid = flattenedGridSignal(layoutText, p.statementMd);
      const drift = lengthDriftSignal(layoutText, p.statementMd);
      rows.push({
        slug: p.slug,
        uvaId,
        sourceUrl: p.sourceUrl,
        hasRunOnSignal: runOn,
        hasGridSignal: grid,
        hasLengthDriftSignal: drift,
        score: runOn + grid + drift,
        fetchError: null,
      });
      console.log(`score=${runOn + grid + drift}`);
    } catch (err) {
      rows.push({
        slug: p.slug,
        uvaId,
        sourceUrl: p.sourceUrl,
        hasRunOnSignal: 0,
        hasGridSignal: 0,
        hasLengthDriftSignal: 0,
        score: 0,
        fetchError: (err as Error).message,
      });
      console.log(`ERROR: ${(err as Error).message}`);
    }
    await sleep(200);
  }

  rows.sort((a, b) => b.score - a.score);
  await writeFile(path.join(AUDIT_DIR, "triage-report.json"), JSON.stringify(rows, null, 2));

  const flaggedRunOn = rows.filter((r) => r.hasRunOnSignal > 0).length;
  const flaggedGrid = rows.filter((r) => r.hasGridSignal > 0).length;
  const flaggedDrift = rows.filter((r) => r.hasLengthDriftSignal > 0).length;
  const failed = rows.filter((r) => r.fetchError).length;
  const summary = `# Statement fidelity triage summary

Total audited: ${rows.length}
Fetch failures: ${failed}
Flagged run-on-paragraph: ${flaggedRunOn}
Flagged flattened-grid/table: ${flaggedGrid}
Flagged length-drift: ${flaggedDrift}
Score 0 (no signal): ${rows.filter((r) => r.score === 0 && !r.fetchError).length}

This is a prioritization aid only — every problem still gets manually checked against its PDF
regardless of score (see packages/db/audit/progress.json).
`;
  await writeFile(path.join(AUDIT_DIR, "triage-summary.md"), summary);
  console.log(`\nDone. Wrote triage-report.json and triage-summary.md.\n${summary}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
