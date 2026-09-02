/**
 * Automated structural QA for the image-restoration + centering pass — the first of the two
 * review layers described in the plan (this one automated; the second is me actually opening the
 * page in a browser in both light/dark mode and comparing against the PDF page, which this script
 * cannot do). Run against whichever DATABASE_URL currently points at (local dev while iterating on
 * a batch, then again against production right after that batch's DB push) before considering a
 * batch done.
 *
 * Checks per problem (statementMd + inputSpecMd + outputSpecMd combined):
 *   1. Every `![...](/problem-images/...)` reference resolves to a file that actually exists under
 *      apps/web/public/problem-images/ and decodes as a valid image (via Pillow).
 *   2. Every `<div class="oj-center">` has a matching `</div>` (equal counts) — an unbalanced tag
 *      would either swallow the rest of the statement into one centered block or leave a dangling
 *      unclosed div.
 *   3. No `<div class="oj-center">` sits immediately inside a ``` fence (that combination was
 *      never intended — code blocks are for monospace-alignment content, centered divs are for
 *      plain-text display content; the two fix types should never nest).
 *   4. Every `<sub>`/`<sup>` has a matching close tag (equal counts each) — same unbalanced-tag
 *      risk as oj-center, just for the subscript/superscript fix.
 *
 * Usage (run from packages/db):
 *   DATABASE_URL=<url> npx tsx scripts/verify-media-fix.ts <slug> [<slug> ...]
 *   DATABASE_URL=<url> npx tsx scripts/verify-media-fix.ts --all   (every row in media-progress.json
 *                                                                    with status fixed-local/fixed-prod
 *                                                                    — the Phase 2 regression sweep)
 */
import { PrismaClient } from "@prisma/client";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const prisma = new PrismaClient();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROGRESS_PATH = path.join(__dirname, "..", "audit", "media-progress.json");
const PUBLIC_DIR = path.join(__dirname, "..", "..", "..", "apps", "web", "public");

const IMAGE_REF_RE = /!\[[^\]]*\]\((\/problem-images\/[^)\s]+)\)/g;
const OJ_CENTER_OPEN_RE = /<div class="oj-center">/g;
const OJ_CENTER_CLOSE_RE = /<\/div>/g;
const SUB_OPEN_RE = /<sub>/g;
const SUB_CLOSE_RE = /<\/sub>/g;
const SUP_OPEN_RE = /<sup>/g;
const SUP_CLOSE_RE = /<\/sup>/g;

async function isValidImage(absPath: string): Promise<boolean> {
  try {
    await execFileAsync("python3", ["-c", `from PIL import Image; Image.open(${JSON.stringify(absPath)}).verify()`]);
    return true;
  } catch {
    return false;
  }
}

interface CheckResult {
  slug: string;
  ok: boolean;
  problems: string[];
}

async function checkProblem(slug: string, combined: string): Promise<CheckResult> {
  const problems: string[] = [];

  const imageRefs = [...combined.matchAll(IMAGE_REF_RE)].map((m) => m[1]);
  for (const ref of imageRefs) {
    const absPath = path.join(PUBLIC_DIR, ref);
    try {
      await access(absPath);
    } catch {
      problems.push(`image reference "${ref}" does not exist on disk (${absPath})`);
      continue;
    }
    if (!(await isValidImage(absPath))) {
      problems.push(`image reference "${ref}" exists but failed to decode as a valid image`);
    }
  }

  const openCount = [...combined.matchAll(OJ_CENTER_OPEN_RE)].length;
  const closeCount = [...combined.matchAll(OJ_CENTER_CLOSE_RE)].length;
  if (openCount !== closeCount) {
    problems.push(`unbalanced oj-center divs: ${openCount} opening tag(s), ${closeCount} closing </div> tag(s)`);
  }

  const subOpen = [...combined.matchAll(SUB_OPEN_RE)].length;
  const subClose = [...combined.matchAll(SUB_CLOSE_RE)].length;
  if (subOpen !== subClose) {
    problems.push(`unbalanced <sub> tags: ${subOpen} opening, ${subClose} closing`);
  }
  const supOpen = [...combined.matchAll(SUP_OPEN_RE)].length;
  const supClose = [...combined.matchAll(SUP_CLOSE_RE)].length;
  if (supOpen !== supClose) {
    problems.push(`unbalanced <sup> tags: ${supOpen} opening, ${supClose} closing`);
  }

  // Fence-nesting check: scan line-by-line, tracking fence state, flag an oj-center div opened
  // while inside a fence.
  let inFence = false;
  for (const line of combined.split("\n")) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence && line.includes('<div class="oj-center">')) {
      problems.push(`found an oj-center div nested inside a \`\`\` code fence — these two fix types must never combine`);
    }
  }

  return { slug, ok: problems.length === 0, problems };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: tsx verify-media-fix.ts <slug> [<slug> ...] | --all");
    process.exit(1);
  }

  let slugs: string[];
  if (args[0] === "--all") {
    interface ProgressRow {
      slug: string;
      status: string;
    }
    const progress: ProgressRow[] = JSON.parse(await readFile(PROGRESS_PATH, "utf-8"));
    slugs = progress.filter((r) => r.status === "fixed-local" || r.status === "fixed-prod").map((r) => r.slug);
    console.log(`Regression sweep: checking ${slugs.length} previously-fixed problems.`);
  } else {
    slugs = args;
  }

  const problems = await prisma.problem.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, statementMd: true, inputSpecMd: true, outputSpecMd: true },
  });
  const found = new Set(problems.map((p) => p.slug));
  for (const slug of slugs) {
    if (!found.has(slug)) console.error(`WARNING: ${slug} not found in database.`);
  }

  let anyFailed = false;
  for (const p of problems) {
    const combined = [p.statementMd, p.inputSpecMd, p.outputSpecMd].join("\n");
    const result = await checkProblem(p.slug, combined);
    if (result.ok) {
      console.log(`PASS  ${result.slug}`);
    } else {
      anyFailed = true;
      console.log(`FAIL  ${result.slug}`);
      for (const problem of result.problems) console.log(`      - ${problem}`);
    }
  }

  if (anyFailed) {
    console.error("\nOne or more problems failed verification — fix before proceeding.");
    process.exit(1);
  }
  console.log(`\nAll ${problems.length} checked problem(s) passed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
