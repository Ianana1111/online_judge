/**
 * CPE-49 test data, batch 4 (8 more problems, 26/49 total).
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-10019-funny-encryption-method", [
    { input: "2\n1\n9999\n", output: "1 1\n8 8\n" },
  ]);

  await seedFromSample("uva-10071-back-to-high-school-physics", [
    { input: "0 0\n-100 200\n", output: "0\n-40000\n" },
  ]);

  await seedFromSample("uva-10093-an-easy-problem", [
    // "ZY" (digit values 35,34, sum=69=3*23) has no valid base 36..62 whose (base-1) divides 69 —
    // a genuine "impossible" case, not just an untested branch.
    { input: "ZY\n0\n", output: "such number is impossible!\n2\n" },
  ]);

  await seedFromSample("uva-10812-beat-the-spread", [
    { input: "2\n0 0\n5 2\n", output: "0 0\nimpossible\n" },
  ]);

  await seedFromSample("uva-11063-b2-sequence", [
    { input: "2\n1 2\n", output: "Case #1: It is a B2-Sequence.\n\n" },
  ]);

  await seedFromSample("uva-11349-symmetric-matrix", [
    { input: "1\nN = 1\n5\n", output: "Test #1: Symmetric.\n" },
  ]);

  await seedFromSample("uva-11461-square-numbers", [
    { input: "1 1\n2 2\n0 0\n", output: "1\n0\n" },
  ]);

  await seedFromSample("uva-948-fibonaccimal-base", [
    {
      input: "2\n1\n99999999\n",
      output: "1 = 1 (fib)\n99999999 = 10101001010100001010000010101010000010 (fib)\n",
    },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
