/**
 * One-time, phase A (DB only): finds submissions graded before the uvaPid fix (see
 * backfill-uva-pid.ts) — their verdicts may have been judged against the wrong UVa problem
 * entirely — resets each to PENDING, and writes their ids to a local file for phase B
 * (rejudge-enqueue.ts) to actually push onto the judge queue. Split in two because Postgres and
 * Redis credentials can't both be injected in a single `railway run` invocation.
 */
import { writeFileSync } from "node:fs";
import { prisma } from "@oj/db";

async function main() {
  const submissions = await prisma.submission.findMany({
    where: { problem: { uvaId: { not: null } } },
    include: { problem: { select: { uvaId: true, title: true } }, user: { select: { handle: true } } },
    orderBy: { createdAt: "asc" },
  });
  console.log(`Found ${submissions.length} submissions to re-judge.`);

  const ids: string[] = [];
  for (const s of submissions) {
    await prisma.submission.update({
      where: { id: s.id },
      data: {
        status: "PENDING",
        verdict: "PENDING",
        timeMs: null,
        memoryKb: null,
        score: 0,
        compileError: null,
        judgedAt: null,
      },
    });
    console.log(`Reset ${s.id} (${s.user.handle}, uva${s.problem.uvaId} ${s.problem.title}, was ${s.verdict})`);
    ids.push(s.id);
  }

  writeFileSync("/tmp/rejudge-ids.json", JSON.stringify(ids, null, 2));
  console.log(`Wrote ${ids.length} ids to /tmp/rejudge-ids.json`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
