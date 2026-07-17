/**
 * CPE-49 test data, batch 7 (final 7 problems, 49/49 total).
 *
 * Every one of these got a from-scratch reference solution written and run against its full
 * scraped Sample first (not hand-traced) to confirm the sample itself is trustworthy before using
 * it as a base for a boundary case:
 *
 * - uva-10908-largest-squares style corruption search came up empty this round — all 7 samples
 *   reproduced exactly, nothing needed a sampleLimit override.
 * - uva-10222-decode-the-mad-man: the "two keys to the left on a QWERTY keyboard" rule isn't
 *   fully spelled out (which rows, how case is handled) — reverse-engineered as four literal
 *   keyboard rows ("1234567890-=", "qwertyuiop[]\", "asdfghjkl;'", "zxcvbnm,./"), case-insensitive
 *   lookup, space passes through unchanged. Verified against all 19 sample lines exactly before
 *   trusting it for the boundary case (which sticks to characters actually exercised by the
 *   sample, to avoid extrapolating into untested keyboard positions like digits or '\').
 * - uva-118-mutant-flatworld-explorers: boundary case specifically exercises the "scent" rule (a
 *   second robot repeating the exact off-grid move of an already-lost robot must be silently
 *   ignored rather than getting lost itself) — the single most commonly-missed part of this
 *   problem and not exercised by more than one grid corner in the official sample.
 * - uva-11150-cola: solved with the standard borrow-up-to-2-bottles-and-repay-at-the-end technique
 *   (only borrowing 0, 1, or 2 ever helps — you never need more than 2 to complete one more group
 *   of 3, and nested re-borrowing collapses to the same thing). Hand-verified N=2 -> 3 by direct
 *   reasoning as a cross-check beyond just matching the one official sample.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-10189-minesweeper", [
    { input: "1 1\n.\n2 2\n*.\n.*\n0 0\n", output: "Field #1:\n0\n\nField #2:\n*2\n2*\n" },
  ]);

  await seedFromSample("uva-10222-decode-the-mad-man", [
    { input: "2\n  K  \nK\n", output: "  h  \nh\n" },
  ]);

  await seedFromSample("uva-10409-die-game", [
    { input: "4\nnorth\nnorth\nnorth\nnorth\n1\neast\n0\n", output: "1\n3\n" },
  ]);

  await seedFromSample("uva-10415-eb-alto-saxophone-player", [
    { input: "2\n\ncccccc\n", output: "0 0 0 0 0 0 0 0 0 0\n0 1 1 1 0 0 1 1 1 1\n" },
  ]);

  await seedFromSample("uva-11150-cola", [{ input: "1\n2\n200\n", output: "1\n3\n300\n" }]);

  await seedFromSample("uva-11321-sort-sort-and-sort", [
    { input: "4 3\n3\n-3\n0\n6\n1 1\n-5\n0 0\n", output: "4 3\n3\n-3\n0\n6\n1 1\n-5\n0 0\n" },
  ]);

  await seedFromSample("uva-118-mutant-flatworld-explorers", [
    { input: "1 1\n0 0 S\nF\n0 0 S\nF\n1 1 N\nRFF\n", output: "0 0 S LOST\n0 0 S\n1 1 E LOST\n" },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
