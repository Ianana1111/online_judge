/**
 * One-time backfill: populates Problem.uvaPid (UVa's internal submission-form problem id) for
 * every existing row with uvaId set. Discovered via a real WA/AC discrepancy report: the remote
 * judge was submitting with the public problem number (uvaId) instead of UVa's own internal id
 * (uvaPid), which are unrelated except by coincidence — every single problem in this table had a
 * mismatch, so every remote-judged submission was potentially graded against the wrong problem's
 * test data. Safe to re-run.
 */
import { prisma } from "@oj/db";
import { fetchUhuntPidMap } from "./uhuntDifficulty.js";

async function main() {
  const pidByNum = await fetchUhuntPidMap();
  console.log(`Fetched uHunt pid map: ${pidByNum.size} entries.`);

  const problems = await prisma.problem.findMany({
    where: { uvaId: { not: null } },
    select: { id: true, uvaId: true, uvaPid: true, title: true },
  });
  console.log(`${problems.length} problems have uvaId set.`);

  let updated = 0;
  let unchanged = 0;
  let notFound = 0;
  for (const p of problems) {
    const correctPid = pidByNum.get(p.uvaId!);
    if (correctPid === undefined) {
      console.warn(`  ! no uHunt entry for uvaId ${p.uvaId} (${p.title}) — leaving uvaPid as-is`);
      notFound++;
      continue;
    }
    if (p.uvaPid === correctPid) {
      unchanged++;
      continue;
    }
    await prisma.problem.update({ where: { id: p.id }, data: { uvaPid: correctPid } });
    updated++;
  }

  console.log(`Done. updated=${updated} unchanged=${unchanged} notFound=${notFound}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
