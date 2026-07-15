/**
 * Read-only audit: for every problem with uvaId set, re-fetch uHunt's current pid map and confirm
 * the stored uvaPid still matches. Also flags any problem missing uvaPid entirely (judgeViaUva
 * refuses to submit those, so they're safe but broken) and any uvaPid value shared by more than
 * one problem (two problems pointing at the same UVa submission target). Makes no writes — run
 * backfill-uva-pid.ts to fix anything this reports.
 */
import { prisma } from "@oj/db";
import { fetchUhuntPidMap } from "./uhuntDifficulty.js";

async function main() {
  const pidByNum = await fetchUhuntPidMap();
  console.log(`Fetched uHunt pid map: ${pidByNum.size} entries.`);

  const problems = await prisma.problem.findMany({
    select: { id: true, slug: true, uvaId: true, uvaPid: true, title: true, visibility: true, source: true },
    orderBy: { uvaId: "asc" },
  });
  const withUvaId = problems.filter((p) => p.uvaId !== null);
  console.log(`${problems.length} total problems, ${withUvaId.length} with uvaId set.`);

  let mismatched = 0;
  let missingPid = 0;
  let notInUhunt = 0;
  const pidOwners = new Map<number, typeof problems>();

  for (const p of withUvaId) {
    const correctPid = pidByNum.get(p.uvaId!);
    if (correctPid === undefined) {
      notInUhunt++;
      console.warn(`  ? no uHunt entry for uvaId ${p.uvaId} (${p.title} / ${p.slug}) — stored uvaPid=${p.uvaPid}`);
    } else if (p.uvaPid === null) {
      missingPid++;
      console.error(`  ! MISSING uvaPid for uvaId ${p.uvaId} (${p.title} / ${p.slug}) — expected ${correctPid}. Submissions to this problem are blocked.`);
    } else if (p.uvaPid !== correctPid) {
      mismatched++;
      console.error(`  ! MISMATCH uvaId ${p.uvaId} (${p.title} / ${p.slug}): stored uvaPid=${p.uvaPid}, uHunt says ${correctPid}`);
    }

    if (p.uvaPid !== null) {
      const owners = pidOwners.get(p.uvaPid) ?? [];
      owners.push(p);
      pidOwners.set(p.uvaPid, owners);
    }
  }

  let collisions = 0;
  for (const [pid, owners] of pidOwners) {
    if (owners.length > 1) {
      collisions++;
      console.error(
        `  ! COLLISION uvaPid=${pid} shared by: ${owners.map((o) => `${o.title} (uvaId=${o.uvaId}, slug=${o.slug})`).join(" | ")}`,
      );
    }
  }

  console.log(
    `Done. mismatched=${mismatched} missingPid=${missingPid} notInUhunt=${notInUhunt} pidCollisions=${collisions}`,
  );
  if (mismatched > 0 || missingPid > 0 || collisions > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
