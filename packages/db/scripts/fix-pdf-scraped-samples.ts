/** One-off data fixes for samples that were scraped out of the problem PDFs and picked up the
 * PDF's typesetting rather than the program's real output. Each one made the Run action disagree
 * with Submit: the sample said one thing, the judging data another, and only the judging data
 * decides AC.
 *
 * - uva 145: the sample output began with "10 16 22 28 31 39", which the statement itself calls
 *   out as "not a part of the output, but only to show the exact tabulation format" — a column
 *   ruler. The remaining data line had also lost its alignment in extraction. The stored TestCase
 *   line puts each field's last character exactly on columns 10/16/22/28/31/39, matching the
 *   ruler, so it is the correct rendering and the sample is replaced with it.
 * - uva 11005: the sample carried a blank line between the two cases and had long base lists hard
 *   wrapped at the PDF's column width. Its input is byte-identical to TestCase ord=1, so that
 *   case's output is by definition the correct sample output.
 *
 * Also strengthens uva 441, where the data was correct but weak: every stored case held a single
 * lotto set, so the statement's "print a blank line between test cases" was never exercised and a
 * solution that omitted the separator would still pass. The sample's own two-set input is added as
 * a case; its expected output was reproduced independently from the combination rules before use.
 */
import { prisma } from "@oj/db";
import { appendTestCase } from "./testcase-seed-helper";

async function fixSampleFromTestCase(slug: string, expectedBefore: string, derive: (testOutput: string) => string) {
  const problem = await prisma.problem.findUniqueOrThrow({
    where: { slug },
    include: { samples: { orderBy: { id: "asc" } }, testCases: { orderBy: { ord: "asc" } } },
  });
  const sample = problem.samples[0];
  if (!sample) throw new Error(`${slug}: no sample`);
  if (sample.output !== expectedBefore) {
    console.log(`${slug}: sample output is not the known-bad value — skipping.`);
    console.log(`  actual: ${JSON.stringify(sample.output)}`);
    return;
  }
  const after = derive(problem.testCases[0].output);
  await prisma.sample.update({ where: { id: sample.id }, data: { output: after } });
  console.log(`${slug}: sample output corrected`);
  console.log(`  before: ${JSON.stringify(expectedBefore)}`);
  console.log(`  after : ${JSON.stringify(after)}`);
}

async function main() {
  // The ruler line plus a misaligned data row; the real row is the first line of the judging data.
  await fixSampleFromTestCase(
    "uva-145-gondwanaland-telecom",
    "          10   16   22   28   31     39\n\n 183-5724      2    4    0    A    0.44",
    (testOutput) => testOutput.replace(/\n+$/, "").split("\n")[0],
  );

  // Same input as ord=1, so that case's output is the sample output, unwrapped and unseparated.
  const cheapest = await prisma.problem.findUniqueOrThrow({
    where: { slug: "uva-11005-cheapest-base" },
    include: { samples: { orderBy: { id: "asc" } }, testCases: { orderBy: { ord: "asc" } } },
  });
  if (cheapest.samples[0].input.trim() !== cheapest.testCases[0].input.trim()) {
    throw new Error("uva-11005: sample input no longer matches TestCase ord=1 — aborting");
  }
  await fixSampleFromTestCase(
    "uva-11005-cheapest-base",
    cheapest.samples[0].output,
    (testOutput) => testOutput.replace(/\n+$/, ""),
  );

  // 441: add the two-set case so the blank-line separator is actually judged.
  const lotto = await prisma.problem.findUniqueOrThrow({
    where: { slug: "uva-441-lotto" },
    include: { samples: { orderBy: { id: "asc" } }, testCases: true },
  });
  const twoSetInput = lotto.samples[0].input;
  if (lotto.testCases.some((t) => t.input.trim() === twoSetInput.trim())) {
    console.log("uva-441-lotto: two-set case already present — skipping.");
  } else {
    await appendTestCase("uva-441-lotto", { input: twoSetInput, output: lotto.samples[0].output });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
