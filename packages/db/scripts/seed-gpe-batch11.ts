/**
 * gpe-history collection, batch 11 (7 problems).
 *
 * Every problem here had a from-scratch reference solution run against its full scraped Sample first
 * (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for a
 * boundary case. No corrupted samples or special-judge problems found in this batch.
 *
 * - uva-10074-take-the-land: classic "maximal all-0 rectangle in a 0/1 matrix" via per-row histogram
 *   (consecutive-zero run length per column, reset on a '1') + stack-based largest-rectangle-in-
 *   histogram, O(M*N) per test case, repeated until "0 0". Verified against the full official sample
 *   (6 test cases, including a 34x34 and a 24x64 matrix). Boundary case uses an all-1s 3x3 grid
 *   (answer 0, no valid rectangle exists at all) and an all-0s 2x3 grid (answer 6 = M*N, the whole
 *   grid is one rectangle) -- both facts independent of the algorithm, from the problem definition.
 * - gpe-24731-roads-in-the-north (uva-10308): tree diameter via double-BFS (BFS from any node to find
 *   a farthest node u, then BFS from u; the farthest distance found is the diameter), datasets
 *   separated by a blank line, terminated at EOF. Verified against the official sample. Boundary case
 *   covers the trivial 2-node single-edge tree (diameter = that edge's own weight, independent of any
 *   BFS logic) and a 3-node path 1-2(w=3)-3(w=4) (diameter = 3+4 = 7, the sum of the only path,
 *   confirmed by hand before trusting the code).
 * - gpe-2009-02-line-overlap-problem (uvaId=null, no external oracle beyond this DB's own
 *   statement+sample): sum of pairwise overlap lengths of N horizontal segments, computed via a
 *   difference array over the bounded coordinate range [0,100000) -- for each unit interval, C(coverage,2)
 *   pairs each contribute 1 to the total, summed via BigInt (statement explicitly warns the total can
 *   exceed 32 bits). Verified against the real official sample AND independently against the problem
 *   statement's own fully-worked example (four segments, overlap_len(1,2)+overlap_len(1,3)+
 *   overlap_len(2,3) = 45+155+20 = 220, hand-computed pair-by-pair from the raw coordinates, not from
 *   the code) -- both matched. Boundary case reuses that worked example as one boundary entry (a
 *   genuine third independent check of the same value) plus a second entry of two fully disjoint
 *   segments (0,5) and (10,15), which must sum to exactly 0.
 * - gpe-24911-robot-instructions (uva-12503): direct simulation -- LEFT/RIGHT push a +-1 delta, and
 *   "SAME AS i" copies the delta already recorded at 1-indexed position i (always a strictly earlier
 *   instruction per the statement's own guarantee), then the position is the sum of all deltas.
 *   Verified against the official sample. Boundary case covers the single-instruction minimum (just
 *   LEFT, answer -1, where "SAME AS" can never legally appear since there's no prior instruction) and
 *   a 3-instruction case (LEFT, RIGHT, SAME AS 2) confirming SAME AS correctly re-executes the
 *   *referenced* instruction's effect (RIGHT, i.e. +1) rather than, say, the most recent one.
 * - gpe-23571-smith-numbers (uva-10042): classic Smith-number search -- trial-division prime
 *   factorization with multiplicity, comparing digit-sum(n) to sum of digit-sum over each prime factor
 *   (with multiplicity), explicitly excluding primes themselves per the problem's own definition.
 *   Verified against the official sample. Boundary case uses two textbook-known values from OEIS
 *   A006753 (the Smith numbers sequence: 4, 22, 27, 58, 85, 94, 121, ...) as an independent check, not
 *   just algorithmic self-consistency: the smallest Smith number greater than 3 is 4 itself (4 = 2*2,
 *   digit sum 4 on both sides), and the next one after that, greater than 21, is 22.
 * - uva-11634-generate-random-numbers: von Neumann middle-square method with n=4 digits -- square the
 *   current 4-digit value (zero-padding the square to 8 digits), take the middle 4 digits as the next
 *   value, and count distinct values produced (including a0 itself) until a value repeats. Verified
 *   against the official sample, including the note that "the third test case has the maximum number
 *   of different values among all possible inputs." Boundary case hand-traces two short, fully
 *   deterministic sequences: a0=1 (1^2="00000001" -> mid 0000 -> a1=0; 0^2="00000000" -> mid 0000,
 *   repeats -> stop; 2 distinct values) and a0=100, a genuine fixed point of the map
 *   (100^2=10000="00010000" -> mid 0100 = 100 itself -> immediately repeats -> 1 distinct value).
 * - gpe-2015-04-the-n-th-element (uvaId=null, no external oracle beyond this DB's own
 *   statement+sample): find the N-th smallest among two length-N strictly-increasing quadratic
 *   sequences (2N elements total) via binary search on the *value* (not the arrays themselves, which
 *   would be infeasible at N up to 10^7): for a candidate value v, count how many of A[0..N-1] and
 *   B[0..N-1] are <= v using an inner binary search over the index (both sequences are strictly
 *   increasing in i), and binary-search v itself for the smallest value whose combined count reaches
 *   N. Verified against the official sample, which is exactly the problem statement's own worked
 *   example (p=2,q=2,r=2 / x=1,y=2,z=3 / N=3 -> answer 6). Boundary case covers the trivial N=1 case
 *   (answer is just min(A[0],B[0]) = min(r,z), independent of any search logic) and a stress case at
 *   the stated N=10^7 upper bound with A and B set to the *identical* sequence (p=q=r=x=y=z=1): with
 *   A=B, the combined sorted multiset is each A[i] appearing twice consecutively, so the N-th (N even)
 *   element is exactly A[N/2-1] = A[4999999] = 4999999^2+4999999+1 = 24999995000001, computed by a
 *   closed-form independent of the binary-search code path and confirmed to match it exactly.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-10074-take-the-land", [
    { input: "3 3\n1 1 1\n1 1 1\n1 1 1\n2 3\n0 0 0\n0 0 0\n0 0\n", output: "0\n6\n" },
  ]);

  await seedFromSample("gpe-24731-roads-in-the-north", [
    { input: "1 2 7\n\n1 2 3\n2 3 4\n", output: "7\n7\n" },
  ]);

  await seedFromSample("gpe-2009-02-line-overlap-problem", [
    { input: "75 325\n5 120\n100 255\n325 500\n.\n", output: "220\n" },
    { input: "0 5\n10 15\n.\n", output: "0\n" },
  ]);

  await seedFromSample("gpe-24911-robot-instructions", [
    { input: "2\n1\nLEFT\n3\nLEFT\nRIGHT\nSAME AS 2\n", output: "-1\n1\n" },
  ]);

  await seedFromSample("gpe-23571-smith-numbers", [{ input: "2\n3\n21\n", output: "4\n22\n" }]);

  await seedFromSample("uva-11634-generate-random-numbers", [{ input: "1\n100\n0\n", output: "2\n1\n" }]);

  await seedFromSample("gpe-2015-04-the-n-th-element", [
    { input: "1\n1 1 5\n1 1 3\n1\n", output: "3\n" },
    { input: "1\n1 1 1\n1 1 1\n10000000\n", output: "24999995000001\n" },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
