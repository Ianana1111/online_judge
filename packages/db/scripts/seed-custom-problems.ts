/**
 * Adds original (non-UVa) problems: statement, display samples and the full hidden corpus.
 *
 * The corpus is private, so it is read from a gitignored file built by its own tooling, e.g.
 *   node --import ./packages/db/node_modules/tsx/dist/loader.mjs packages/db/scripts/seed-custom-problems.ts \
 *     --data=generated/class-problems-20261112/seed-data.json [--apply]
 *
 * Review-only by default. --apply writes everything in one transaction. Problems are matched by
 * slug: re-running is a no-op when the stored problem already equals the file, and any other
 * existing problem with that slug aborts the whole run instead of being overwritten.
 */
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { prisma, Prisma, type CheckerType } from "../src/index.js";

type Case = { ord: number; input: string; output: string };
type SeedProblem = {
  slug: string; title: string; statementMd: string; inputSpecMd: string; outputSpecMd: string;
  timeLimitMs: number; memoryLimitKb: number; difficulty: number; source: "CUSTOM";
  checkerType: CheckerType; floatEps: number | null; tags: string[]; samples: Case[]; testCases: Case[];
};

const option = (name: string) => process.argv.find((s) => s.startsWith(`--${name}=`))?.slice(name.length + 3);
const sameCases = (stored: Case[], wanted: Case[]) =>
  JSON.stringify(stored.map(({ ord, input, output }) => ({ ord, input, output })).sort((a, b) => a.ord - b.ord)) ===
  JSON.stringify([...wanted].sort((a, b) => a.ord - b.ord));

async function main() {
  const file = option("data");
  if (!file || !resolve(file).startsWith(resolve("generated") + sep)) throw new Error("--data must point into generated/");
  const { problems } = JSON.parse(await readFile(file, "utf8")) as { problems: SeedProblem[] };
  const apply = process.argv.includes("--apply");
  for (const p of problems) {
    if (p.source !== "CUSTOM") throw new Error(`${p.slug}: only CUSTOM problems are seeded here`);
    if (!p.samples.length || !p.testCases.length) throw new Error(`${p.slug}: needs at least one sample and one hidden case`);
  }

  const rows = await prisma.$transaction(async (tx) => {
    if (!apply) await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
    const report: { slug: string; status: string }[] = [];
    for (const p of problems) {
      const existing = await tx.problem.findUnique({ where: { slug: p.slug }, include: { samples: true, testCases: true } });
      if (existing) {
        const same = existing.uvaId === null && existing.title === p.title && existing.statementMd === p.statementMd &&
          existing.checkerType === p.checkerType && existing.timeLimitMs === p.timeLimitMs && existing.memoryLimitKb === p.memoryLimitKb &&
          sameCases(existing.samples, p.samples) && sameCases(existing.testCases, p.testCases);
        if (!same) throw new Error(`${p.slug}: a different problem already uses this slug; refusing to overwrite`);
        report.push({ slug: p.slug, status: "ALREADY_PRESENT" });
        continue;
      }
      const tags = await tx.tag.findMany({ where: { slug: { in: p.tags } }, select: { id: true } });
      if (tags.length !== p.tags.length) throw new Error(`${p.slug}: unknown tag`);
      if (!apply) { report.push({ slug: p.slug, status: `READY (${p.samples.length} sample, ${p.testCases.length} hidden)` }); continue; }
      const created = await tx.problem.create({
        data: {
          slug: p.slug, title: p.title, statementMd: p.statementMd, inputSpecMd: p.inputSpecMd, outputSpecMd: p.outputSpecMd,
          timeLimitMs: p.timeLimitMs, memoryLimitKb: p.memoryLimitKb, difficulty: p.difficulty, difficultyLocked: true,
          source: p.source, checkerType: p.checkerType, floatEps: p.floatEps,
          tags: { create: tags.map((t) => ({ tagId: t.id })) },
        },
      });
      await tx.sample.createMany({ data: p.samples.map((c) => ({ ...c, problemId: created.id })) });
      await tx.testCase.createMany({ data: p.testCases.map((c) => ({ ...c, problemId: created.id })) });
      report.push({ slug: p.slug, status: "CREATED" });
    }
    return report;
  }, { maxWait: 10_000, timeout: 120_000, isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  console.log(JSON.stringify({ apply, rows }, null, 2));
}

main()
  .catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
