/**
 * One-off backfill: recomputes every problem's difficulty from uHunt's DACU data. See
 * uhuntDifficulty.ts for why DACU (not accept rate, which this used originally) and where the
 * thresholds come from. Safe to re-run any time the thresholds or uHunt's data change.
 */
import { PrismaClient } from "@prisma/client";
import { dacuToDifficulty, fetchUhuntDacu } from "./uhuntDifficulty.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching uHunt DACU data...");
  const dacuByUvaId = await fetchUhuntDacu();
  console.log(`Got DACU for ${dacuByUvaId.size} UVa problems.`);

  const problems = await prisma.problem.findMany({
    where: { uvaId: { not: null } },
    select: { id: true, uvaId: true, slug: true, difficulty: true },
  });
  console.log(`Found ${problems.length} problems with a UVa id.`);

  const counts = [0, 0, 0, 0, 0]; // index by difficulty 1-4, 0 = no data
  let updated = 0;
  for (const p of problems) {
    const dacu = dacuByUvaId.get(p.uvaId!);
    if (dacu === undefined) {
      console.warn(`  ! ${p.slug} (uva${p.uvaId}): no uHunt data, leaving difficulty=${p.difficulty}`);
      counts[0]++;
      continue;
    }
    const difficulty = dacuToDifficulty(dacu);
    counts[difficulty]++;
    if (difficulty !== p.difficulty) {
      await prisma.problem.update({ where: { id: p.id }, data: { difficulty } });
      updated++;
    }
  }
  console.log(`\nDone. Updated ${updated}/${problems.length} problems.`);
  console.log(`Distribution: ★=${counts[1]} ★★=${counts[2]} ★★★=${counts[3]} ★★★★=${counts[4]} (no data=${counts[0]})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
