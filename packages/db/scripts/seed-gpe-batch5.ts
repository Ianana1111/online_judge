/**
 * gpe-history collection, batch 5 (7 problems).
 *
 * Every problem here had a from-scratch reference solution run against its full scraped Sample
 * first (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for
 * a boundary case.
 *
 * - gpe-10500-brick-wall-patterns: 2×n domino tiling count, a Fibonacci recurrence
 *   (f(n)=f(n-1)+f(n-2), f(0)=f(1)=1). Sample only covers n=1..3; the problem statement itself
 *   rhetorically asks "how many patterns for length 4? And 5?" — used those as an independently
 *   trustworthy boundary (f(4)=5, f(5)=8, the well-known Fibonacci values), plus n=50 (the stated
 *   max) computed via BigInt to rule out precision loss at the upper bound.
 * - gpe-10604-packing-polygons: minimum-enclosing-circle decision problem. Reference solution tries
 *   every pair (as a diameter circle) and every triple (as a circumcircle) and keeps the smallest
 *   that contains all vertices — necessary because for an obtuse triangle the true minimum enclosing
 *   circle is the 2-point diameter circle, which is *smaller* than the 3-point circumcircle; a
 *   solution that only ever computes the circumcircle would wrongly reject a polygon that actually
 *   fits. Boundary case includes exactly that obtuse-triangle trap (points (0,0),(10,0),(1,0.1)) with
 *   R=4.5, deliberately below the diameter-circle radius of 5, to catch that specific bug.
 * - gpe-24941-uncompress: classic move-to-front decompression. Boundary case references a
 *   *non-front* list position (forcing real reordering, not just a front-position no-op) to make
 *   sure the position bookkeeping is genuinely tracked, not just always reading index 0.
 * - gpe-10615-divisibility: N-dimensional Pascal simplex divisibility — the value at a cell is a
 *   multinomial coefficient, and by Kummer's theorem it's *not* divisible by prime P iff summing the
 *   coordinates digit-by-digit in base P produces no carry anywhere. Verified this generalized-carry
 *   rule against all 3 official cases via brute-force enumeration of each (small) sub-hypercube
 *   before trusting it. Boundary case's second dataset (N=2, P=19, the full 19×19 base-19 digit
 *   square) was cross-checked independently against the closed-form triangular-number count for
 *   2D Lucas' theorem (19·20/2 = 190) rather than just trusting the same code path that produced it.
 * - uva-10336-rank-the-languages: 4-directional flood-fill component count per letter, sorted by
 *   count descending then letter ascending. All 15 official sub-cases matched. Boundary case adds an
 *   explicit tie ("abab": two 1-cell "a" states, two 1-cell "b" states) to exercise the alphabetical
 *   tiebreak the larger official cases don't cleanly isolate.
 * - gpe-10582-power-strings: standard KMP-failure-function period detection
 *   (n / (n - fail[n-1]) when n is divisible by the period, else 1). Boundary case adds a
 *   single-character string (trivial n=1) and a 4x repeat of a 3-char block, neither exercised by
 *   the official 3-line sample.
 * - gpe-2015-07-minimum-path-sum (uvaId=null — this one credits "Source of the problem: LeetCode" in
 *   its own statementMd, so it's knowingly non-UVA-sourced but still has a well-known canonical
 *   answer; no local judge special-casing needed since it's a plain unique-shortest-path-sum DP with
 *   no room for multiple valid outputs). Standard DP matched the official 2-case sample exactly.
 *   Boundary case's second dataset places a 0 off the diagonal to force a genuine down-then-right
 *   detour (sum 3) instead of the straight path through the top row (sum 7), catching an
 *   implementation that only checks contiguous-edge moves without properly comparing both DP
 *   predecessors.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("gpe-10500-brick-wall-patterns", [{ input: "4\n5\n50\n0\n", output: "5\n8\n20365011074\n" }]);

  await seedFromSample("gpe-10604-packing-polygons", [
    {
      input: "4\n0 0\n2 0\n2 2\n0 2\n1.5\n3\n0 0\n10 0\n1 0.1\n4.5\n0\n",
      output: "The polygon can be packed in the circle.\nThere is no way of packing that polygon.\n",
    },
  ]);

  await seedFromSample("gpe-24941-uncompress", [{ input: "cat dog bird 3 2\n0\n", output: "cat dog bird cat bird\n" }]);

  await seedFromSample("gpe-10615-divisibility", [
    { input: "2\n1 5\n3\n10\n2 19\n0 0\n18 18\n", output: "Case 1: 8\nCase 2: 190\n" },
  ]);

  await seedFromSample("uva-10336-rank-the-languages", [
    { input: "2\n1 4\nabab\n1 1\nz\n", output: "World #1\na: 2\nb: 2\nWorld #2\nz: 1\n" },
  ]);

  await seedFromSample("gpe-10582-power-strings", [{ input: "z\nabcabcabcabc\n.\n", output: "1\n4\n" }]);

  await seedFromSample("gpe-2015-07-minimum-path-sum", [
    { input: "2\n1 1\n5\n2 3\n1 0 5\n3 1 1\n", output: "5\n3\n" },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
