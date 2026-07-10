/**
 * One-off backfill: earlier scrapes embedded a "**UVa {id} — {title}**\n\nSourced from ... [原始
 * PDF](url)" header directly inside statementMd - redundant with the page's own title heading,
 * and the PDF link belongs on the title itself now (see Problem.sourceUrl + ProblemView.tsx).
 * Extracts that URL into sourceUrl and strips the header block from the body. Also upgrades the
 * "**Input**"/"**Output**" bold section markers (from an earlier formatting pass) to real ###
 * headings so they pick up the larger heading styles instead of just being bold body text.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HEADER_RE = /^\*\*UVa \d+(?: — .*?)?\*\*\n\nSourced from [^\n]*?\[原始 PDF\]\(([^)]+)\)\n\n/;
const SECTION_HEADERS = ["Input and Output", "Input", "Output", "Explanation", "Note", "Constraints"];

function upgradeBoldHeaders(text: string): string {
  let out = text;
  for (const h of SECTION_HEADERS) {
    out = out.replace(new RegExp(`^\\*\\*${h}\\*\\*$`, "gm"), `### ${h}`);
  }
  return out;
}

async function main() {
  // Covers both problems still carrying the old embedded header (contains "Sourced from") and
  // ones from an earlier backfill pass that already had the header stripped but still use the
  // old **Input**/**Output** bold markers instead of ### headings.
  const problems = await prisma.problem.findMany({
    where: { OR: [{ statementMd: { contains: "Sourced from" } }, { statementMd: { contains: "**Input**" } }, { statementMd: { contains: "**Output**" } }] },
    select: { id: true, slug: true, statementMd: true, sourceUrl: true },
  });
  console.log(`Found ${problems.length} problems to reformat.`);

  let updated = 0;
  for (const p of problems) {
    const match = p.statementMd.match(HEADER_RE);
    const body = upgradeBoldHeaders(match ? p.statementMd.slice(match[0].length) : p.statementMd);
    const sourceUrl = match?.[1] ?? p.sourceUrl;
    await prisma.problem.update({ where: { id: p.id }, data: { statementMd: body, sourceUrl } });
    updated++;
  }
  console.log(`Done. Updated ${updated}/${problems.length} problems.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
