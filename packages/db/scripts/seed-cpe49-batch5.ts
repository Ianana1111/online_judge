/**
 * CPE-49 test data, batch 5 (8 more problems, 34/49 total).
 *
 * uva-11005-cheapest-base's scraped Sample.output has PDF line-wrapping baked in as literal
 * newlines (confirmed by the problem statement's own text: "the numbers... are actually all in
 * one line... shown broken in two lines [due to] lack of horizontal space"). Using it verbatim
 * would grade a correct single-line solution WA. Not trusted here — sampleLimit 0, and the
 * boundary case below is the same sample input with the wrapping corrected, verified against the
 * unwrapped portion (case 1) that matched without any fixing needed.
 *
 * uva-10190-divide-but-not-quite-conquer: caught a wrong assumption while authoring this — n=1
 * looks like it should trivially be a valid 1-element sequence (k=1, restrictions vacuously
 * satisfied), but the real official sample expects "Boring!" for it. Fixed by trusting the sample
 * over the theoretical reading of the spec.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-10050-hartals", [{ input: "1\n7\n1\n2\n", output: "2\n" }]);

  await seedFromSample("uva-10190-divide-but-not-quite-conquer", [
    {
      input: "1 5\n5 0\n1073741824 2\n",
      output:
        "Boring!\nBoring!\n1073741824 536870912 268435456 134217728 67108864 33554432 16777216 8388608 4194304 2097152 1048576 524288 262144 131072 65536 32768 16384 8192 4096 2048 1024 512 256 128 64 32 16 8 4 2 1\n",
    },
  ]);

  await seedFromSample("uva-10193-all-you-need-is-love", [
    { input: "1\n10\n10\n", output: "Pair #1: All you need is love!\n" },
  ]);

  await seedFromSample("uva-10931-parity", [{ input: "3\n0\n", output: "The parity of 11 is 2 (mod 2).\n" }]);

  await seedFromSample("uva-10235-simply-emirp", [{ input: "13\n31\n", output: "13 is emirp.\n31 is emirp.\n" }]);

  await seedFromSample("uva-10922-2-the-9s", [
    { input: "27\n999999999\n0\n", output: "27 is a multiple of 9 and has 9-degree 1.\n999999999 is a multiple of 9 and has 9-degree 2.\n" },
  ]);

  await seedFromSample("uva-11417-gcd", [{ input: "2\n0\n", output: "1\n" }]);

  await seedFromSample(
    "uva-11005-cheapest-base",
    [
      {
        input:
          "2\n10 8 12 13 15 13 13 16 9\n11 18 24 21 23 23 23 13 15\n17 33 21 23 27 26 27 19 4\n22 18 30 30 24 16 26 21 21\n5\n98329921\n12345\n800348\n14\n873645\n1 1 1 1 1 1 1 1 1\n1 1 1 1 1 1 1 1 1\n1 1 1 1 1 1 1 1 1\n1 1 1 1 1 1 1 1 1\n4\n0\n1\n10\n100\n",
        output:
          "Case 1:\nCheapest base(s) for number 98329921: 24\nCheapest base(s) for number 12345: 13 31\nCheapest base(s) for number 800348: 31\nCheapest base(s) for number 14: 13\nCheapest base(s) for number 873645: 22\nCase 2:\nCheapest base(s) for number 0: 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36\nCheapest base(s) for number 1: 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36\nCheapest base(s) for number 10: 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36\nCheapest base(s) for number 100: 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36\n",
      },
    ],
    0,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
