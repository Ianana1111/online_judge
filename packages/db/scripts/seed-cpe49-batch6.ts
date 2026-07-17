/**
 * CPE-49 test data, batch 6 (8 more problems, 42/49 total).
 *
 * uva-10908-largest-squares's scraped Sample.output has two spurious blank lines inserted between
 * the "M N Q" header and the Q answer lines (a scraping artifact, not a real part of the expected
 * format — the statement's own Q+1-line spec and hand-verification of all 4 answers against the
 * sample grid confirm the answers themselves are correct, just mis-spaced). Not trusted here —
 * sampleLimit 0, boundary case below is the same sample input with the corrected spacing.
 *
 * uva-10642-can-you-solve-it references a picture (a numbered diagonal grid of circles) that isn't
 * present in the text-only statement. Reverse-engineered the numbering purely from the 23 given
 * input/output pairs: circle (x,y) has index (x+y)(x+y+1)/2 + x (standard antidiagonal
 * enumeration, ordered by increasing x within each diagonal), and steps(src,dst) =
 * index(dst) - index(src). Verified exactly against all 23 sample cases including the largest
 * (19999799999 for (0,1)->(99999,99999)).
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-10057-a-mid-summer-night-s-dream", [{ input: "1\n0\n", output: "0 1 1\n" }]);

  await seedFromSample("uva-10221-satellites", [{ input: "0 0 min\n", output: "0.000000 0.000000\n" }]);

  await seedFromSample("uva-10642-can-you-solve-it", [
    { input: "1\n0 100000 100000 0\n", output: "Case 1: 100000\n" },
  ]);

  await seedFromSample("uva-10242-fourth-point", [{ input: "0 0 5 0 5 0 5 5\n", output: "0.000 5.000\n" }]);

  await seedFromSample("uva-10062-tell-me-the-frequencies", [{ input: "a\n", output: "97 1\n" }]);

  await seedFromSample(
    "uva-10908-largest-squares",
    [
      {
        input:
          "1\n7 10 4\nabbbaaaaaa\nabbbaaaaaa\nabbbaaaaaa\naaaaaaaaaa\naaaaaaaaaa\naaccaaaaaa\naaccaaaaaa\n1 2\n2 4\n4 6\n5 2\n",
        output: "7 10 4\n3\n1\n5\n1\n",
      },
    ],
    0,
  );

  await seedFromSample("uva-299-train-swapping", [{ input: "1\n0\n\n", output: "Optimal train swapping takes 0 swaps.\n" }]);

  await seedFromSample("uva-10226-hardwood-species", [{ input: "1\n\nOak\n", output: "Oak 100.0000\n" }]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
