/**
 * Read-only export of selected problems (with samples and hidden cases) and the contests that
 * use them, in the snapshot format audit.ts, the Run pipeline test, the oracles and publish.ts read.
 * node --import ./packages/db/node_modules/tsx/dist/loader.mjs scripts/editorials/export-snapshot.ts \
 *   --only=slug,slug --out=generated/<dir>/snapshot.json
 * The file contains private judging data, so it may only be written under generated/ or /private/tmp/.
 */
import { writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { prisma } from "../../packages/db/src/index";
import { sha256 } from "./evidence";

async function main() {
  const option = (name: string) => process.argv.find(s => s.startsWith(`--${name}=`))?.slice(name.length + 3);
  const slugs = option("only")?.split(","), out = option("out");
  if (!slugs?.length || !out) throw new Error("--only and --out are required");
  const target = resolve(out);
  if (![resolve("generated") + sep, "/private/tmp/"].some(prefix => target.startsWith(prefix))) throw new Error("Snapshot must stay in a private directory");
  const { problems, contests } = await prisma.$transaction(async tx => {
    await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
    const problems = await tx.problem.findMany({
      where: { slug: { in: slugs } }, orderBy: { slug: "asc" },
      include: { samples: { orderBy: { ord: "asc" } }, testCases: { orderBy: { ord: "asc" } }, tags: { include: { tag: true } } },
    });
    const contests = await tx.contest.findMany({
      where: { problems: { some: { problemId: { in: problems.map(p => p.id) } } } }, orderBy: { slug: "asc" },
      include: { problems: { orderBy: { ord: "asc" } } },
    });
    return { problems, contests };
  }, { isolationLevel: "RepeatableRead", timeout: 60_000 });
  if (problems.length !== slugs.length) throw new Error("Unknown problem slug");
  const body = JSON.parse(JSON.stringify({ problems, contests }));
  const snapshot = { capturedAt: new Date().toISOString(), contentHash: sha256(JSON.stringify(body)), ...body };
  await writeFile(target, JSON.stringify(snapshot), { mode: 0o600 });
  console.log(JSON.stringify({ problems: problems.length, contests: contests.length, contentHash: snapshot.contentHash }));
}
main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
