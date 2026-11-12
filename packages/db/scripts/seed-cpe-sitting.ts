/**
 * Adds one newly published CPE sitting: its new problems (statement, display sample and the full
 * hidden corpus) plus the Contest and its A..G problem order with CPE's own per-problem stats.
 *
 * The corpus is private, so it is read from a gitignored file built by the sitting's tooling, e.g.
 *   node --import ./packages/db/node_modules/tsx/dist/loader.mjs packages/db/scripts/seed-cpe-sitting.ts \
 *     --data=generated/cpe-2026-10-06/seed-data.json [--apply]
 *
 * Review-only by default. --apply writes everything in one transaction. Re-running is a no-op when
 * the stored rows already equal the file; any other existing row with the same uvaId, slug or
 * contest slug aborts the whole run instead of being overwritten. Editorials are published later
 * through scripts/editorials/publish.ts, never here.
 */
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { prisma, Prisma, type CheckerType, type ProblemSource } from "../src/index.js";

type Case = { ord: number; input: string; output: string };
type SeedProblem = {
  slug: string; uvaId: number; uvaPid: number; title: string; statementMd: string; sourceUrl: string;
  inputSpecMd: string; outputSpecMd: string; timeLimitMs: number; memoryLimitKb: number; difficulty: number;
  source: ProblemSource; checkerType: CheckerType; floatEps: number | null; tags: string[];
  samples: Case[]; testCases: Case[];
};
type SeedContest = {
  slug: string; title: string; avgCorrectCount: number | null; totalCandidates: number | null;
  problems: { uvaId: number; label: string; ord: number; submissions: number; attempted: number; correct: number }[];
};

const option = (name: string) => process.argv.find((s) => s.startsWith(`--${name}=`))?.slice(name.length + 3);
const sameCases = (stored: Case[], wanted: Case[]) =>
  JSON.stringify(stored.map(({ ord, input, output }) => ({ ord, input, output })).sort((a, b) => a.ord - b.ord)) ===
  JSON.stringify([...wanted].sort((a, b) => a.ord - b.ord));

async function main() {
  const file = option("data");
  if (!file || !resolve(file).startsWith(resolve("generated") + sep)) throw new Error("--data must point into generated/");
  const { problems, contest } = JSON.parse(await readFile(file, "utf8")) as { problems: SeedProblem[]; contest: SeedContest };
  const apply = process.argv.includes("--apply");

  const rows = await prisma.$transaction(async (tx) => {
    if (!apply) await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
    const report: { target: string; status: string }[] = [];
    for (const p of problems) {
      const existing = await tx.problem.findUnique({ where: { uvaId: p.uvaId }, include: { samples: true, testCases: true } });
      const bySlug = await tx.problem.findUnique({ where: { slug: p.slug }, select: { uvaId: true } });
      if (bySlug && bySlug.uvaId !== p.uvaId) throw new Error(`${p.slug}: slug belongs to another problem`);
      if (existing) {
        const same = existing.slug === p.slug && existing.statementMd === p.statementMd && existing.checkerType === p.checkerType &&
          existing.timeLimitMs === p.timeLimitMs && existing.memoryLimitKb === p.memoryLimitKb &&
          sameCases(existing.samples, p.samples) && sameCases(existing.testCases, p.testCases);
        if (!same) throw new Error(`${p.slug}: UVa ${p.uvaId} already exists with different content; refusing to overwrite`);
        report.push({ target: p.slug, status: "ALREADY_PRESENT" });
        continue;
      }
      const tags = await tx.tag.findMany({ where: { slug: { in: p.tags } }, select: { id: true, slug: true } });
      if (tags.length !== p.tags.length) throw new Error(`${p.slug}: unknown tag`);
      if (!apply) { report.push({ target: p.slug, status: `READY (${p.samples.length} sample, ${p.testCases.length} hidden)` }); continue; }
      const created = await tx.problem.create({
        data: {
          slug: p.slug, uvaId: p.uvaId, uvaPid: p.uvaPid, title: p.title, statementMd: p.statementMd, sourceUrl: p.sourceUrl,
          inputSpecMd: p.inputSpecMd, outputSpecMd: p.outputSpecMd, timeLimitMs: p.timeLimitMs, memoryLimitKb: p.memoryLimitKb,
          difficulty: p.difficulty, source: p.source, checkerType: p.checkerType, floatEps: p.floatEps,
          tags: { create: tags.map((t) => ({ tagId: t.id })) },
        },
      });
      await tx.sample.createMany({ data: p.samples.map((c) => ({ ...c, problemId: created.id })) });
      await tx.testCase.createMany({ data: p.testCases.map((c) => ({ ...c, problemId: created.id })) });
      report.push({ target: p.slug, status: "CREATED" });
    }

    const problemIds = new Map<number, string>();
    for (const cp of contest.problems) {
      const found = await tx.problem.findUnique({ where: { uvaId: cp.uvaId }, select: { id: true } });
      if (found) problemIds.set(cp.uvaId, found.id);
      else if (apply || !problems.some((p) => p.uvaId === cp.uvaId)) throw new Error(`${contest.slug}: UVa ${cp.uvaId} is missing`);
    }
    const existingContest = await tx.contest.findUnique({ where: { slug: contest.slug }, include: { problems: true } });
    if (existingContest) {
      const same = existingContest.kind === "CPE" && existingContest.problems.length === contest.problems.length &&
        contest.problems.every((cp) => existingContest.problems.some((row) => row.problemId === problemIds.get(cp.uvaId) && row.label === cp.label && row.ord === cp.ord));
      if (!same) throw new Error(`${contest.slug}: contest already exists with a different problem set`);
      report.push({ target: contest.slug, status: "ALREADY_PRESENT" });
    } else if (!apply) {
      report.push({ target: contest.slug, status: `READY (${contest.problems.length} problems)` });
    } else {
      await tx.contest.create({
        data: {
          slug: contest.slug, title: contest.title, kind: "CPE", durationMin: 180, freezeMin: 60, penaltyMin: 20, scoring: "ICPC",
          isPublic: true, avgCorrectCount: contest.avgCorrectCount, totalCandidates: contest.totalCandidates,
          problems: { create: contest.problems.map((cp) => ({
            problemId: problemIds.get(cp.uvaId)!, label: cp.label, ord: cp.ord,
            submissions: cp.submissions, attempted: cp.attempted, correct: cp.correct,
          })) },
        },
      });
      report.push({ target: contest.slug, status: "CREATED" });
    }
    return report;
  }, { maxWait: 10_000, timeout: 120_000, isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  console.log(JSON.stringify({ apply, rows }, null, 2));
}

main()
  .catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
