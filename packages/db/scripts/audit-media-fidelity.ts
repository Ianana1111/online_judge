/**
 * Triage pass for the image-restoration + centering pass (see the plan) — does NOT fix anything.
 * For each of the 414 problems with a uvaId, reuses the PDF already cached by
 * audit-statement-fidelity.ts (packages/db/audit/pdf-cache/{uvaId}.pdf — never re-fetches) and:
 *
 * 1. Runs `pdfimages -list` to find embedded raster image objects, excluding the recurring
 *    480x114 "UVa Online Judge" letterhead logo (+ its 480x114 smask) that appears on page 1 of
 *    essentially every one of these PDFs regardless of source (confirmed across onlinejudge.org-
 *    and cpe.mcu.edu.tw-hosted copies alike). This is exhaustive for raster-embedded figures —
 *    pdfimages reports every image XObject in the file, nothing to miss.
 * 2. Flags likely vector-drawn diagrams via a keyword scan of statementMd (figure/diagram/"shown
 *    below" etc.) — pdfimages can't see these (no embedded raster object), so this is a
 *    lower-confidence candidate list for manual pdftoppm-page-render review, not exhaustive.
 * 3. Flags likely "PDF-centered" standalone content (a tuple list, a short formula, a small
 *    matrix) via `pdftotext -layout` indentation analysis: for each PDF, computes the paragraph
 *    baseline indent (the mode of small per-line leading-space counts), then flags any line that
 *    is blank-line-isolated (blank before AND after) with indent well above that baseline —
 *    exactly the shape of uva-105's two centered tuple lines (indent 12 and 30 against a baseline
 *    of 0/4). Mechanical and exhaustive across all 414; still needs human review per candidate.
 *
 * Output: packages/db/audit/media-triage-report.json (one row per problem) — a prioritization
 * aid, see the plan for how each category is actually worked through.
 *
 * Run from packages/db: `pnpm exec tsx scripts/audit-media-fidelity.ts`
 */
import { PrismaClient } from "@prisma/client";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const prisma = new PrismaClient();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIT_DIR = path.join(__dirname, "..", "audit");
const CACHE_DIR = path.join(AUDIT_DIR, "pdf-cache");

// The letterhead logo + its soft mask, confirmed identical across every sampled PDF regardless of
// which of the two hosts (onlinejudge.org vs. cpe.mcu.edu.tw) actually served it.
const LOGO_WIDTH = 480;
const LOGO_HEIGHT = 114;

const VECTOR_DIAGRAM_KEYWORDS = /figure\s*\d*|the\s+diagram|shown\s+(in|below|above)|as\s+shown|picture\s+below|illustrat/i;

interface ImageObjectRow {
  page: number;
  width: number;
  height: number;
  color: string;
  enc: string;
}

interface CenterCandidateRow {
  lineIndex: number;
  indent: number;
  baseline: number;
  text: string;
}

interface MediaTriageRow {
  slug: string;
  uvaId: number;
  imageObjects: ImageObjectRow[];
  hasVectorDiagramCandidate: boolean;
  centerCandidates: CenterCandidateRow[];
  fetchError: string | null;
}

async function pdfImagesList(pdfPath: string): Promise<ImageObjectRow[]> {
  const { stdout } = await execFileAsync("pdfimages", ["-list", pdfPath]);
  const lines = stdout.split("\n").slice(2); // header + separator
  const rows: ImageObjectRow[] = [];
  for (const line of lines) {
    const cols = line.trim().split(/\s+/);
    if (cols.length < 6) continue;
    const [pageStr, , type, widthStr, heightStr, color] = cols;
    const enc = cols[8] ?? "";
    const page = Number(pageStr);
    const width = Number(widthStr);
    const height = Number(heightStr);
    if (!Number.isFinite(page) || !Number.isFinite(width) || !Number.isFinite(height)) continue;
    if (type === "smask") continue; // always paired with its parent image, never independently useful
    if (width === LOGO_WIDTH && height === LOGO_HEIGHT) continue; // letterhead logo
    rows.push({ page, width, height, color, enc });
  }
  return rows;
}

async function pdfToLayoutText(pdfPath: string): Promise<string> {
  const { stdout } = await execFileAsync("pdftotext", ["-layout", pdfPath, "-"]);
  return stdout;
}

/** Mode of small (1-8 char) leading-indent counts across non-blank lines — the PDF's normal
 * paragraph-start/body indent, used as the baseline that a genuinely centered line's indent must
 * clear by a wide margin (see CENTER_INDENT_MARGIN). */
function paragraphBaselineIndent(lines: string[]): number {
  const counts = new Map<number, number>();
  for (const line of lines) {
    if (line.trim() === "") continue;
    const indent = line.length - line.trimStart().length;
    if (indent > 8) continue; // already unusual — don't let it skew the baseline
    counts.set(indent, (counts.get(indent) ?? 0) + 1);
  }
  let best = 0;
  let bestCount = -1;
  for (const [indent, count] of counts) {
    if (count > bestCount) {
      best = indent;
      bestCount = count;
    }
  }
  return best;
}

const CENTER_INDENT_MARGIN = 8; // must clear baseline by this many columns to count as "centered"
const CENTER_MAX_LINE_LENGTH = 140; // centered display content is short; long lines are just prose

function findCenterCandidates(pdfLayoutText: string): CenterCandidateRow[] {
  const lines = pdfLayoutText.split("\n").map((l) => l.replace(/\s+$/, ""));
  const baseline = paragraphBaselineIndent(lines);
  const candidates: CenterCandidateRow[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    const prevBlank = i === 0 || lines[i - 1].trim() === "";
    const nextBlank = i === lines.length - 1 || lines[i + 1].trim() === "";
    if (!prevBlank || !nextBlank) continue;
    const indent = line.length - line.trimStart().length;
    if (indent < baseline + CENTER_INDENT_MARGIN) continue;
    if (line.trim().length > CENTER_MAX_LINE_LENGTH) continue; // too long to be a short display block
    // Section headers ("Input", "Output", ...) sometimes land here too if oddly indented in a
    // particular PDF's layout extraction — exclude single all-caps-or-titlecase short words.
    if (/^[A-Z][a-zA-Z]*$/.test(line.trim())) continue;
    candidates.push({ lineIndex: i, indent, baseline, text: line.trim() });
  }
  return candidates;
}

async function main() {
  const problems = await prisma.problem.findMany({
    where: { uvaId: { not: null } },
    select: { slug: true, uvaId: true, statementMd: true },
    orderBy: { uvaId: "asc" },
  });
  console.log(`Media-triaging ${problems.length} problems (reusing cached PDFs — no network fetches).`);

  const rows: MediaTriageRow[] = [];
  let missingPdf = 0;
  for (const [i, p] of problems.entries()) {
    process.stdout.write(`[${i + 1}/${problems.length}] ${p.slug}... `);
    const uvaId = p.uvaId!;
    const cachedPath = path.join(CACHE_DIR, `${uvaId}.pdf`);
    try {
      await access(cachedPath);
    } catch {
      missingPdf++;
      rows.push({
        slug: p.slug,
        uvaId,
        imageObjects: [],
        hasVectorDiagramCandidate: false,
        centerCandidates: [],
        fetchError: "not in pdf-cache — run audit-statement-fidelity.ts first to populate the cache",
      });
      console.log("NOT CACHED");
      continue;
    }
    try {
      const [imageObjects, layoutText] = await Promise.all([pdfImagesList(cachedPath), pdfToLayoutText(cachedPath)]);
      const hasVectorDiagramCandidate = imageObjects.length === 0 && VECTOR_DIAGRAM_KEYWORDS.test(p.statementMd);
      const centerCandidates = findCenterCandidates(layoutText);
      rows.push({ slug: p.slug, uvaId, imageObjects, hasVectorDiagramCandidate, centerCandidates, fetchError: null });
      console.log(`images=${imageObjects.length} vectorCandidate=${hasVectorDiagramCandidate} centerCandidates=${centerCandidates.length}`);
    } catch (err) {
      rows.push({
        slug: p.slug,
        uvaId,
        imageObjects: [],
        hasVectorDiagramCandidate: false,
        centerCandidates: [],
        fetchError: (err as Error).message,
      });
      console.log(`ERROR: ${(err as Error).message}`);
    }
  }

  await mkdir(AUDIT_DIR, { recursive: true });
  await writeFile(path.join(AUDIT_DIR, "media-triage-report.json"), JSON.stringify(rows, null, 2));

  const withImages = rows.filter((r) => r.imageObjects.length > 0).length;
  const withVectorCandidate = rows.filter((r) => r.hasVectorDiagramCandidate).length;
  const withCenterCandidate = rows.filter((r) => r.centerCandidates.length > 0).length;
  console.log(
    `\nDone. ${rows.length} problems triaged (${missingPdf} not cached).\n` +
      `With embedded raster image(s): ${withImages}\n` +
      `Vector-diagram keyword candidates: ${withVectorCandidate}\n` +
      `Centering candidates: ${withCenterCandidate}\n` +
      `Wrote media-triage-report.json.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
