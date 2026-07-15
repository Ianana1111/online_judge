/** Read-only: dumps the stored statementMd for a given set of slugs so it can be compared against
 * candidate UVa problems by hand before committing to any uvaId re-match. */
import { prisma } from "@oj/db";

async function main() {
  const slugs = process.argv.slice(2);
  const rows = await prisma.problem.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, title: true, statementMd: true },
  });
  for (const r of rows) {
    console.log(`===== ${r.slug} (${r.title}) =====`);
    console.log(r.statementMd.slice(0, 1500));
    console.log();
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
