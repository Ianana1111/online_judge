/**
 * Standalone (no-collection) UVA problems, batch C (7 problems).
 *
 * Every problem here had a from-scratch reference solution run against its full scraped Sample first
 * (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for a
 * boundary case. No corrupted samples or special-judge problems found in this batch.
 *
 * - uva-10161-ant-on-a-chessboard: the snake-spiral path forms concentric "L-shaped rings" where ring
 *   k covers values (k-1)^2+1..k^2 (2k-1 cells); re-derived the exact per-ring direction rule from the
 *   problem's own worked 5x5 example (odd k: start at (k,1), go up to (k,k), then left to (1,k); even
 *   k: start at (1,k), go right to (k,k), then down to (k,1)) and confirmed it against all of the
 *   example's own annotated points (times 1, 8, 20 and the full grid), not just the official DB
 *   sample. Since N can be up to 2*10^9, uses an O(1) ring computation (k = ceil(sqrt(N)), corrected
 *   for floating-point sqrt error via a small adjustment loop) rather than simulating the path.
 *   Boundary case uses N=82 (the first cell of ring k=10, even) and N=121 (the last cell of ring k=11,
 *   odd), both independently re-derived by hand from the ring-boundary rule rather than by trusting
 *   the sqrt-based code path on a large N.
 * - uva-10191-longest-nap: merge all appointments (input order is explicitly unspecified) into
 *   non-overlapping busy intervals, then find the longest gap between 10:00, each merge boundary, and
 *   18:00, breaking ties by earliest start. Verified against the official sample (a large real-world
 *   schedule). Boundary case is a single midday appointment (12:00-13:00): the two candidate free
 *   gaps are 10:00-12:00 (120 min) and 13:00-18:00 (300 min) -- clearly the second is longer,
 *   hand-computed independent of the merge logic, and exercises the ">= 60 minutes" duration-format
 *   branch ("5 hours and 0 minutes").
 * - uva-10200-prime-time: for each queried range, count how many n in [a,b] make n^2+n+41 prime (trial
 *   division, since b <= 10000 keeps n^2+n+41 under ~10^8, trivially fast per query), then output the
 *   percentage to 2 decimals -- with no '%' sign, confirmed against the official sample's exact
 *   formatting (a literal reading of the sample text, not the ambiguous prose). Boundary case covers
 *   a=b=0 (n=0: 0+0+41=41, prime, 100%) and a=b=1 (n=1: 1+1+41=43, prime, 100%) -- both primality facts
 *   independently checkable by hand from Euler's own famous formula, not from the counting code.
 * - uva-10229-modular-fibonacci: fast-doubling Fibonacci computed mod 2^m, with the degenerate m=0
 *   case (mod 1) handled explicitly (always 0, since every integer is 0 mod 1). Verified against the
 *   official sample. Boundary case covers m=0 (100 mod 1 = 0 regardless of which Fibonacci number) and
 *   n=0 (F_0=0 by definition, independent of m) in the same input.
 * - uva-10267-graphical-editor: full pixel-editor command simulation (I/C/L/V/H/K/F/S/X), with flood
 *   fill (F) via iterative stack-based DFS, unrecognized command letters silently ignored per the
 *   statement, and -- critically -- all drawing commands (L/V/H/K/F) bounds-checked and silently
 *   no-op'd when given out-of-range coordinates. This bounds-checking was NOT obvious from the
 *   statement (which says such errors are merely "unpredictable"), but was required to reproduce the
 *   official sample exactly: the real sample contains a stray `L 0 0 X` (coordinates outside the
 *   declared 20x20 grid) between two `S` (save) commands, and the official expected output for the
 *   following save shows no trace of that out-of-range paint -- confirming the reference behavior is
 *   "silently ignore," not "crash" or "wrap/clamp." Boundary case is a minimal 2x2 grid: paint pixel
 *   (1,1) with 'A', then flood-fill from (2,2) [still default 'O'] with 'B' -- since (2,2)'s region
 *   (all-'O' cells) includes (2,1) and (1,2) but not (1,1) (different color), the fill must stop at the
 *   'A' boundary, giving grid rows "AB" / "BB", hand-traced before trusting the flood-fill code.
 * - uva-10273-eat-or-not-to-eat: day-by-day simulation where the cow with strictly-unique minimum milk
 *   that day is eaten (ties mean nobody is eaten that day), detecting permanent deadlock by tracking
 *   days-since-last-elimination against the LCM of the currently-alive cows' production periods (since
 *   the joint milk pattern of the surviving herd is exactly periodic with that LCM, no elimination
 *   within one full such cycle means none will ever happen again). Verified against the official
 *   sample. Boundary case uses 3 cows with constant (period-1) milk amounts 1, 2, 2: day 1 has a
 *   strict unique minimum (cow with milk=1, eaten), leaving two cows permanently tied at milk=2 every
 *   subsequent day -- John stays puzzled forever, so the simulation must correctly detect this
 *   deadlock rather than looping forever, leaving 2 cows alive with the last (and only) elimination on
 *   day 1 -- both facts independently reasoned from the tie/elimination rule directly, not from
 *   running the simulation blind.
 * - uva-10309-turn-the-lights-off: classic 10x10 "Lights Out" solved by brute-forcing all 2^10 choices
 *   for whether to press each switch in row 0, then greedily determining every subsequent row's presses
 *   as forced (a cell only stays lit if the switch directly below it is pressed), checking whether the
 *   last row ends up fully off, and taking the minimum total presses across all 1024 first-row choices
 *   (or -1 if none work, or if the true minimum exceeds the stated 100-press cutoff). Verified against
 *   the full official sample. Boundary case is a board that's already entirely off: the correct answer
 *   is trivially 0 presses, independent of the search algorithm (pressing nothing is itself always one
 *   of the 1024 candidates considered).
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-10161-ant-on-a-chessboard", [{ input: "82\n121\n0\n", output: "1 10\n1 11\n" }]);

  await seedFromSample("uva-10191-longest-nap", [
    {
      input: "1\n12:00 13:00 lunch\n",
      output: "Day #1: the longest nap starts at 13:00 and will last for 5 hours and 0 minutes.\n",
    },
  ]);

  await seedFromSample("uva-10200-prime-time", [{ input: "0 0\n1 1\n", output: "100.00\n100.00\n" }]);

  await seedFromSample("uva-10229-modular-fibonacci", [{ input: "100 0\n0 5\n", output: "0\n0\n" }]);

  await seedFromSample("uva-10267-graphical-editor", [
    { input: "I 2 2\nL 1 1 A\nF 2 2 B\nS test\nX\n", output: "test\nAB\nBB\n" },
  ]);

  await seedFromSample("uva-10273-eat-or-not-to-eat", [
    { input: "1\n3\n1 1\n1 2\n1 2\n", output: "2 1\n" },
  ]);

  await seedFromSample("uva-10309-turn-the-lights-off", [
    {
      input:
        "allOff\n##########\n##########\n##########\n##########\n##########\n##########\n##########\n##########\n##########\n##########\nend\n",
      output: "allOff 0\n",
    },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
