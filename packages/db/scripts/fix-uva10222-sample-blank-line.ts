/** One-off data fix: uva-10222-decode-the-mad-man's stored Sample output carries a blank line
 * between the two decoded messages, but the real TestCase outputs (the ones that decide AC) put
 * one line per test case with no separator, and the statement says only "For each test case,
 * print a line containing the decoded words."
 *
 * The blank line is an artifact of scraping the PDF, where the two sample lines are set with
 * paragraph spacing between them. Its effect was that the Run action — which compares against the
 * Sample — rejected solutions that Submit then accepted, so a correct answer looked wrong in the
 * one place a learner checks first.
 *
 * Only the Sample is touched. The TestCase rows are already correct and are left alone.
 */
import { prisma } from "@oj/db";

const SLUG = "uva-10222-decode-the-mad-man";
const BEFORE = "how are you\n\ngood morning";
const AFTER = "how are you\ngood morning";

async function main() {
  const problem = await prisma.problem.findUniqueOrThrow({
    where: { slug: SLUG },
    include: { samples: { orderBy: { id: "asc" } }, testCases: { orderBy: { ord: "asc" } } },
  });

  const sample = problem.samples[0];
  if (!sample) throw new Error("expected a sample");
  if (sample.output !== BEFORE) {
    console.log("Stored sample output doesn't match the expected 'before' state — aborting without changes.");
    console.log("Actual:", JSON.stringify(sample.output));
    return;
  }

  // Guard the premise: the fix is only correct because the judging data has no separator either.
  const separatorInTests = problem.testCases.some((t) =>
    t.output.replace(/\n+$/, "").split("\n").some((line) => line === ""),
  );
  if (separatorInTests) {
    console.log("A TestCase output contains a blank line — the separator may be required. Aborting.");
    return;
  }

  await prisma.sample.update({ where: { id: sample.id }, data: { output: AFTER } });
  console.log(`Fixed ${SLUG} Sample: removed the blank line between the two decoded messages.`);
  console.log(`  before: ${JSON.stringify(BEFORE)}`);
  console.log(`  after : ${JSON.stringify(AFTER)}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
