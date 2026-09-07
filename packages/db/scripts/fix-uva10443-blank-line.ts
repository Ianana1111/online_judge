/** One-off data fix found during the judge-rigor verification audit (see the audit plan):
 * uva-10443-rock-scissors-paper's problem statement explicitly requires "Leave an empty line
 * between the output for successive test cases," but the stored TestCase (ord 1, which has 2
 * scenarios in its input) is missing that blank line between the first scenario's 3-line grid and
 * the second scenario's 4-line grid. Confirmed by hand-tracing both scenarios against the
 * problem's rock-paper-scissors rules — both grids are otherwise byte-for-byte correct, only the
 * separator is missing. A spec-compliant reference solution (which prints the blank line) was
 * getting WA against this test case purely because of this data bug, not because of anything
 * wrong with the solution.
 */
import { prisma } from "@oj/db";

async function main() {
  const problem = await prisma.problem.findUniqueOrThrow({
    where: { slug: "uva-10443-rock-scissors-paper" },
    include: { testCases: { orderBy: { ord: "asc" } } },
  });
  const tc1 = problem.testCases.find((t) => t.ord === 1);
  if (!tc1) throw new Error("expected ord=1 test case not found");

  const before = "RRR\nRRR\nRRR\nRRRS\nRRSP\nRSPR\n";
  const after = "RRR\nRRR\nRRR\n\nRRRS\nRRSP\nRSPR\n";
  if (tc1.output !== before) {
    console.log("Stored output doesn't match the expected 'before' state — aborting without changes.");
    console.log("Actual stored output:", JSON.stringify(tc1.output));
    return;
  }

  await prisma.testCase.update({ where: { id: tc1.id }, data: { output: after } });
  console.log("Fixed uva-10443-rock-scissors-paper TestCase ord=1: inserted missing blank line between scenarios.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
