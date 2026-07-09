/**
 * Applies a primary algorithmic-topic tag to every CPE-sourced problem, from CSV files of the
 * form `uvaId,CATEGORY,note` (one per line, no header). CATEGORY must be one of TOPIC_MAP's keys.
 * Safe to re-run: clears any existing topic tag on a problem before applying the new one.
 *
 * Usage: pnpm --filter @oj/db exec tsx scripts/apply-topic-tags.ts <csv-file> [<csv-file> ...]
 */
import { readFileSync } from "node:fs";
import { prisma } from "@oj/db";

const TOPIC_MAP: Record<string, { slug: string; name: string }> = {
  MATH: { slug: "math", name: "Math" },
  GEOMETRY: { slug: "geometry", name: "Geometry" },
  STRING: { slug: "string", name: "String" },
  ARRAY: { slug: "array", name: "Array" },
  SORTING_SEARCHING: { slug: "sorting-searching", name: "Sorting/Searching" },
  GREEDY: { slug: "greedy", name: "Greedy" },
  DP: { slug: "dp", name: "Dynamic Programming" },
  GRAPH: { slug: "graph", name: "Graph" },
  RECURSION_BACKTRACKING: { slug: "recursion-backtracking", name: "Recursion/Backtracking" },
  DATASTRUCTURE: { slug: "datastructure", name: "Data Structure" },
  SIMULATION: { slug: "simulation", name: "Simulation" },
  ADHOC: { slug: "adhoc", name: "Ad-hoc" },
};
const ALL_TOPIC_SLUGS = new Set(Object.values(TOPIC_MAP).map((t) => t.slug));

interface Row {
  uvaId: number;
  category: string;
  note: string;
}

function parseCsv(path: string): Row[] {
  const lines = readFileSync(path, "utf-8").split("\n").filter((l) => l.trim().length > 0);
  return lines.map((line) => {
    const [uvaId, category, ...rest] = line.split(",");
    return { uvaId: parseInt(uvaId, 10), category: category.trim(), note: rest.join(",").trim() };
  });
}

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("Usage: tsx scripts/apply-topic-tags.ts <csv-file> [<csv-file> ...]");
    process.exit(1);
  }

  const rows = files.flatMap(parseCsv);
  console.log(`Parsed ${rows.length} classification rows from ${files.length} file(s).`);

  const tagIdBySlug = new Map<string, string>();
  for (const { slug, name } of Object.values(TOPIC_MAP)) {
    const tag = await prisma.tag.upsert({ where: { slug }, update: { name }, create: { slug, name } });
    tagIdBySlug.set(slug, tag.id);
  }

  let applied = 0;
  let missingProblem = 0;
  let unknownCategory = 0;

  for (const row of rows) {
    const mapped = TOPIC_MAP[row.category];
    if (!mapped) {
      console.warn(`  ! unknown category "${row.category}" for uva ${row.uvaId}, skipping`);
      unknownCategory++;
      continue;
    }
    const problem = await prisma.problem.findUnique({ where: { uvaId: row.uvaId } });
    if (!problem) {
      console.warn(`  ! no problem with uvaId ${row.uvaId} in DB, skipping`);
      missingProblem++;
      continue;
    }

    // Clear any previously-applied topic tag (idempotent re-run / re-classification) without
    // touching non-topic tags a problem might also have (e.g. hand-seeded "warmup").
    const existingTopicLinks = await prisma.problemTag.findMany({
      where: { problemId: problem.id, tag: { slug: { in: [...ALL_TOPIC_SLUGS] } } },
    });
    if (existingTopicLinks.length > 0) {
      await prisma.problemTag.deleteMany({
        where: { problemId: problem.id, tagId: { in: existingTopicLinks.map((l) => l.tagId) } },
      });
    }

    await prisma.problemTag.create({
      data: { problemId: problem.id, tagId: tagIdBySlug.get(mapped.slug)! },
    });
    applied++;
  }

  console.log(`\nApplied ${applied} topic tags. Missing problems: ${missingProblem}. Unknown categories: ${unknownCategory}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
