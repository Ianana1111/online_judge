/**
 * One-off: the "CPE 必考 49 題" collection comes from an official one-star selection (the source
 * list is explicitly a 一顆星選集 — problems that appeared as ★ in real CPE sittings). That's a
 * human-verified difficulty rating, which must outrank anything derived from DACU or topic tags —
 * derivation had drifted some of these up to 2-4★ ("simple but obscure" problems have low DACU,
 * which reads as hard; and one had a wrong dp tag, see below). Pin all 49 to difficulty=1 and set
 * difficultyLocked so backfill-difficulty.ts / scrape-cpe.ts never overwrite them again.
 *
 * Also fixes the mis-tag that caused the worst outlier: uva 10409 (Die Game) was tagged `dp`, but
 * it's a pure dice-rolling simulation — the dp topic floor was rating it 4★.
 */
import { prisma } from "@oj/db";

async function main() {
  const collection = await prisma.collection.findUnique({
    where: { slug: "cpe-basic-49" },
    include: { problems: { select: { problemId: true } } },
  });
  if (!collection) throw new Error("cpe-basic-49 collection not found");
  const ids = collection.problems.map((cp) => cp.problemId);

  const res = await prisma.problem.updateMany({
    where: { id: { in: ids } },
    data: { difficulty: 1, difficultyLocked: true },
  });
  console.log(`Locked ${res.count}/${ids.length} collection problems at difficulty=1.`);

  // uva 10409: dp -> simulation
  const dieGame = await prisma.problem.findUnique({ where: { uvaId: 10409 } });
  const dpTag = await prisma.tag.findUnique({ where: { slug: "dp" } });
  const simTag = await prisma.tag.findUnique({ where: { slug: "simulation" } });
  if (dieGame && dpTag && simTag) {
    const removed = await prisma.problemTag.deleteMany({ where: { problemId: dieGame.id, tagId: dpTag.id } });
    if (removed.count > 0) {
      await prisma.problemTag.upsert({
        where: { problemId_tagId: { problemId: dieGame.id, tagId: simTag.id } },
        update: {},
        create: { problemId: dieGame.id, tagId: simTag.id },
      });
      console.log("Retagged uva10409 Die Game: dp -> simulation.");
    } else {
      console.log("uva10409 already has no dp tag, nothing to retag.");
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
