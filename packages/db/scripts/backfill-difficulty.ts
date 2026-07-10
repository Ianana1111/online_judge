/**
 * One-off backfill: every problem was created with difficulty hardcoded to 1 (see scrape-cpe.ts
 * history) - derives a real 1-4 star rating from uHunt's accept-rate data instead. See
 * uhuntDifficulty.ts for where the thresholds come from.
 */
import { PrismaClient } from "@prisma/client";
import { acRateToDifficulty, fetchUhuntAcRates } from "./uhuntDifficulty.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching uHunt accept-rate data...");
  const rates = await fetchUhuntAcRates();
  console.log(`Got accept rates for ${rates.size} UVa problems.`);

  const problems = await prisma.problem.findMany({
    where: { uvaId: { not: null } },
    select: { id: true, uvaId: true, slug: true, difficulty: true },
  });
  console.log(`Found ${problems.length} problems with a UVa id.`);

  const counts = [0, 0, 0, 0, 0]; // index by difficulty 1-4, 0 = no rate data
  let updated = 0;
  for (const p of problems) {
    const rate = rates.get(p.uvaId!);
    if (rate === undefined) {
      console.warn(`  ! ${p.slug} (uva${p.uvaId}): no uHunt data, leaving difficulty=${p.difficulty}`);
      counts[0]++;
      continue;
    }
    const difficulty = acRateToDifficulty(rate);
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
