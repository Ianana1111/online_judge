/**
 * CPE-49 test data, batch 2 (5 more problems beyond the original 5-problem pilot).
 *
 * uva-10101-bangla-numbers is the interesting one here: the extra 22 test cases this project's own
 * Sample table carries beyond UVa's own 2-case official sample turned out to include a genuine
 * error (the largest-value case), caught by writing a mathematically self-consistent recursive
 * solution, noticing it reproduced UVa's real 2 samples exactly but diverged from that one local
 * case, and settling it by actually submitting through the site's real UVa relay — AC. So this
 * problem's boundary/regression case here is derived from the verified solution, not copied from
 * the (partially wrong) local Sample data, and only the 2 official-UVa-PDF samples are trusted
 * as "Sample" for it.
 *
 * uva-10420-list-of-conquests caught a second, more general bug: this project's scraped Sample
 * input data has CRLF line endings, which silently breaks the extremely common
 * `cin >> n; cin.ignore(); getline(...)` idiom (ignore() only eats the '\r', leaving a phantom
 * empty first line that shifts everything after it) — a real, technically-correct student solution
 * would have gotten a false WA against the raw scraped data for no algorithmic reason. Fixed at the
 * source in testcase-seed-helper.ts (normalizes CRLF -> LF for every problem's data, not just this
 * one), not by special-casing this problem.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  // Only UVa's own 2 official samples — see file header for why the rest of this project's
  // locally-scraped Sample rows for this problem aren't trusted.
  await seedFromSample(
    "uva-10101-bangla-numbers",
    [
      {
        input: "0\n100\n10000000\n999999999999999\n",
        output:
          "   1. 0\n   2. 1 shata\n   3. 1 kuti\n   4. 9 kuti 99 lakh 99 hajar 9 shata 99 kuti 99 lakh 99 hajar 9 shata 99\n",
      },
    ],
    2,
  );

  await seedFromSample("uva-10420-list-of-conquests", [
    { input: "3\nZambia Alice\nAustria Bob\nZambia Carol\n", output: "Austria 1\nZambia 2\n" },
  ]);

  await seedFromSample("uva-10008-what-s-cryptanalysis", [{ input: "2\naabb\n\n", output: "A 2\nB 2\n" }]);

  await seedFromSample("uva-11332-summing-digits", [{ input: "5\n2000000000\n0\n", output: "5\n2\n" }]);

  await seedFromSample("uva-10252-common-permutation", [
    { input: "abc\nxyz\naabbcc\naabbcc\n", output: "\naabbcc\n" },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
