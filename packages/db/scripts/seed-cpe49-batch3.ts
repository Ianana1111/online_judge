/**
 * CPE-49 test data, batch 3 (8 more problems, 18/49 total).
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-10038-jolly-jumpers", [{ input: "1 5\n", output: "Jolly\n" }]);

  await seedFromSample("uva-10056-what-is-the-probability", [
    { input: "1\n1 0.5 1\n", output: "1.0000\n" },
  ]);

  await seedFromSample("uva-10170-the-hotel-with-infinite-rooms", [
    { input: "5 1\n1 1000000000000\n", output: "5\n1414214\n" },
  ]);

  await seedFromSample("uva-10268-498-bis", [{ input: "100\n5 7\n", output: "5\n" }]);

  await seedFromSample("uva-10783-odd-sum", [
    { input: "3\n0 0\n100 100\n1 1\n", output: "Case 1: 0\nCase 2: 0\nCase 3: 1\n" },
  ]);

  await seedFromSample("uva-12019-doom-s-day-algorithm", [
    { input: "2\n3 1\n1 1\n", output: "Tuesday\nSaturday\n" },
  ]);

  await seedFromSample("uva-272-tex-quotes", [
    { input: '"a" "b" "c"\n', output: "``a'' ``b'' ``c''\n" },
  ]);

  await seedFromSample("uva-490-rotating-sentences", [{ input: "Hi\n", output: "H\ni\n" }]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
