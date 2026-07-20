/**
 * Standalone (no-collection) problems, batch A (7 problems).
 *
 * Every problem here had a from-scratch reference solution run against its full scraped Sample first
 * (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for a
 * boundary case. No corrupted samples or special-judge problems found in this batch.
 *
 * - uva-10004-bicoloring: standard BFS 2-coloring check on an undirected graph, repeated until n=0.
 *   Verified against the full 30-case official sample. Boundary case covers the smallest possible
 *   bicolorable graph (a single edge between 2 nodes) and the smallest odd cycle (a 3-node triangle,
 *   never bicolorable since any odd cycle forces two adjacent same-colored nodes).
 * - uva-10010-where-s-waldorf: brute-force 8-directional word search over the grid (case-insensitive),
 *   scanning cells in row-major then column-major order within each direction check so the first match
 *   found is naturally the uppermost, then leftmost, occurrence as required. Verified against the full
 *   10-case official sample, including large 40x33- and 44x37-cell grids. Boundary case is the
 *   trivial 1x1 grid searching for its own single letter.
 * - uva-10018-reverse-and-add: repeated reverse-and-add via BigInt (sums can exceed the stated
 *   4,294,967,295 bound only transiently before reaching the palindrome). Verified against the full
 *   20-case official sample. Boundary case specifically confirms that even an *already-palindromic*
 *   starting number (11) still forces exactly one addition before being reported (11+11=22, not "0
 *   11") -- the algorithm is unconditionally do-while, never short-circuiting on an already-palindromic
 *   input, confirmed by the official sample's own similar case ("11" -> "1 22") rather than assumed.
 * - uva-10025-the-1-2-n-k-problem: classic result that the minimal n is the smallest value where
 *   S(n)=n(n+1)/2 satisfies both S(n) >= |k| and S(n)-|k| is even (necessary and sufficient: flipping
 *   any subset of the 1..n terms negative changes the sum by an even amount, and achievability of every
 *   value in the resulting arithmetic-progression-with-gaps is a standard, well-known fact for this
 *   exact problem). Verified against the full 16-case official sample, including negative k values
 *   (absolute value taken first, matching the sample's negative inputs producing the same class of
 *   answers as their positive counterparts). Boundary case covers the smallest nonzero case, k=1: the
 *   single-term expression "+1" already equals 1, so n=1 -- confirmed by hand from the formula
 *   (S(1)=1 >= 1 and 1-1=0 is even) independent of the code path.
 * - uva-10026-shoemaker-s-problem: classic exchange-argument scheduling result -- the optimal job order
 *   sorts by fine/time ratio descending (compared via cross-multiplication S_i*T_j vs S_j*T_i to avoid
 *   floating-point ratio comparison), with ties broken by ascending original job index to guarantee the
 *   lexicographically-first job-number sequence among equally optimal orderings (any two adjacent
 *   equal-ratio jobs can be swapped without changing the total fine, so the smallest achievable
 *   permutation picks the lower original index first). Verified against the full 6-case official
 *   sample, including large N up to 1000 jobs. Boundary case is a 2-job tie (identical time=1,fine=5
 *   ratio for both): confirms the tie-break keeps the original 1,2 order rather than an arbitrary one.
 * - uva-10036-divisibility: boolean reachability DP over remainders mod K (N up to 10000, K up to
 *   100, so O(N*K) is trivial), each new number's value added or subtracted from every currently
 *   reachable remainder. Verified against both official cases (divisible by 7, not divisible by 5, for
 *   the same 4-number sequence -- a genuine positive/negative pair rather than two independent trivial
 *   cases). Boundary case is the single-number sequence [5] with K=5: trivially divisible, since a
 *   lone term with no sign choice to make still equals 5 which is divisible by 5 by definition.
 * - uva-10066-the-twin-towers: longest common subsequence (LCS) length between the two towers' radius
 *   sequences (standard O(N1*N2) DP), repeated until "0 0", with "Twin Towers #k" / "Number of Tiles :
 *   L" formatting. Verified against the full 20-case official sample, including two 99/100-tile towers
 *   at the largest allowed size. Found the same "statement says print a blank line after every dataset,
 *   but the real sample only has blank lines *between* datasets, not after the last one" mismatch seen
 *   repeatedly elsewhere in this project -- trusted the sample's real formatting. Boundary case is the
 *   simplest possible nontrivial pair: two single-tile towers of matching radius 5, giving LCS length 1.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-10004-bicoloring", [
    { input: "2\n1\n0 1\n3\n3\n0 1\n1 2\n2 0\n0\n", output: "BICOLORABLE.\nNOT BICOLORABLE.\n" },
  ]);

  await seedFromSample("uva-10010-where-s-waldorf", [
    { input: "1\n\n1 1\na\n1\nA\n", output: "1 1\n" },
  ]);

  await seedFromSample("uva-10018-reverse-and-add", [{ input: "1\n11\n", output: "1 22\n" }]);

  await seedFromSample("uva-10025-the-1-2-n-k-problem", [{ input: "1\n1\n", output: "1\n" }]);

  await seedFromSample("uva-10026-shoemaker-s-problem", [
    { input: "1\n2\n1 5\n1 5\n", output: "1 2\n" },
  ]);

  await seedFromSample("uva-10036-divisibility", [
    { input: "1\n1 5\n5\n", output: "Divisible\n" },
  ]);

  await seedFromSample("uva-10066-the-twin-towers", [
    { input: "1 1\n5\n5\n0 0\n", output: "Twin Towers #1\nNumber of Tiles : 1\n" },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
