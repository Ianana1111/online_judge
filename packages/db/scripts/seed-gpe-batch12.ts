/**
 * gpe-history collection, batch 12 (7 problems).
 *
 * Every problem here had a from-scratch reference solution run against its full scraped Sample first
 * (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for a
 * boundary case. No corrupted samples or special-judge problems found in this batch.
 *
 * - gpe-10636-gopher-ii (uva-10080): bipartite maximum matching (Kuhn's augmenting-path algorithm)
 *   between gophers and holes, with an edge iff the straight-line distance is <= s*v (the max distance
 *   coverable in the time limit at the stated velocity); answer = n - matching size. Verified against
 *   the official sample. Boundary case covers a single gopher/hole pair that's too far to reach
 *   (distance 100*sqrt(2) vs a reach of just 1 -> stays vulnerable, answer 1) and one that's exactly
 *   within reach (distance 5 = s*v = 5*5=25... note: 3-4-5 right triangle distance exactly 5, reach
 *   budget 5*5=25 -- comfortably reachable, answer 0).
 * - gpe-10505-center-of-masses (uva-10002): area-weighted polygon centroid (NOT a plain vertex
 *   average -- the standard shoelace-based centroid formula), applied after first re-ordering the
 *   input points around the polygon via a convex hull (monotone chain), since the problem explicitly
 *   states the points are given "in no particular order." Verified against all 3 official cases,
 *   including the unit-square case (trivially centroid (0.5,0.5), independent of the formula) and a
 *   triangle (where the area-centroid formula coincides with the simple vertex average, giving a
 *   second, algorithm-independent check: (1+1+0)/3, (2+0+0)/3 = 0.667, 0.667). Boundary case adds a
 *   3-4-5 right triangle (0,0),(4,0),(0,3): centroid = simple vertex average (4/3, 1) = (1.333, 1.000),
 *   hand-computed independently of the polygon-area formula since triangle centroids never need it.
 * - gpe-2009-17-binary-tree-traversals (uvaId=null, no external oracle beyond this DB's own
 *   statement+sample): standard preorder+inorder -> postorder reconstruction via recursive divide on
 *   the inorder root-split index. Verified against all 3 official cases, including the fully-skewed
 *   n=12 case (preorder A..L ascending, inorder L..A descending) which stress-tests the recursion's
 *   handling of a maximally unbalanced tree. Boundary case is the trivial single-node tree (n=1),
 *   confirming the base case returns just that one node without any recursive split logic engaging.
 * - gpe-21964-fill-the-containers (uva-11413): "split array into (at most) m contiguous groups,
 *   minimizing the maximum group sum" -- solved via binary search on the candidate maximum capacity X,
 *   with a greedy linear-scan feasibility check (minimum number of contiguous groups needed to keep
 *   every group sum <= X). Verified against both official cases, including the second one's
 *   explanation in the problem statement itself (that {4,78}+{9} beats the naive {4}+{78,9} split,
 *   giving 82 not 87) -- confirmed the reference solution reproduces exactly 82, not the naive
 *   alternative. Boundary case covers m >= n (more containers than vessels): with 3 containers for
 *   only 3 vessels, each vessel becomes trivially its own container, so the answer is just the single
 *   largest vessel capacity (3), independent of the binary-search machinery.
 * - gpe-11184-opening-doors (uva-10606): classic "100 doors" toggle puzzle -- door k ends open iff k
 *   has an odd number of divisors, i.e. iff k is a perfect square, so the answer is simply the largest
 *   perfect square <= N. Since N is given as a decimal string up to 10^100, computed via an
 *   arbitrary-precision BigInt integer-square-root (Newton's method) rather than floating-point sqrt.
 *   Verified against the official sample (N=90 -> 81 = 9^2). Boundary case covers N=99 (still 81,
 *   confirming 10^2=100 is correctly excluded as it exceeds N) and N=1 (the smallest possible input,
 *   trivially 1 = 1^2).
 * - uva-382-perfection: sum-of-proper-divisors classification (perfect/deficient/abundant) via O(sqrt n)
 *   divisor pairing, with the exact "PERFECTION OUTPUT" / "END OF OUTPUT" banner lines and
 *   5-space-right-justified-number + 2-space + label formatting. Verified against the full official
 *   sample (multiple classifications). Boundary case uses three textbook-known values independent of
 *   the code: 6 (the smallest perfect number, 1+2+3=6), 9 (deficient, proper divisors 1+3=4 < 9), and
 *   12 (abundant, proper divisors 1+2+3+4+6=16 > 12) -- all well-known facts from the number-theory
 *   definitions themselves, not derived from the classification code.
 * - gpe-2015-02-recursion-and-mod (uvaId=null, no external oracle beyond this DB's own
 *   statement+sample): the recurrence f(n)=3*f(n-1)+4, f(1)=1 has a clean closed form -- substituting
 *   g(n)=f(n)+2 gives g(n)=3*g(n-1) with g(1)=3, so g(n)=3^n and f(n)=3^n-2 -- independently re-derived
 *   by hand (not just pattern-matched from the sample) and confirmed against all 4 official sample
 *   values (f(2)=7=9-2, f(3)=25=27-2, f(4)=79=81-2). Computed via BigInt fast modular exponentiation
 *   mod 10^9+9 to handle n up to 2^63-1 (n itself, not just f(n), is far too large for repeated
 *   recursive/iterative doubling by hand). Boundary case covers n=1 (trivial base case, f(1)=1
 *   independent of the closed form) and n=2^63-1 (the stated upper bound), cross-checked against the
 *   closed-form 3^n-2 mod p computed via a second, independent modpow call rather than trusting the
 *   same code path that seeded it.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("gpe-10636-gopher-ii", [
    {
      input: "1 1 1 1\n0.0 0.0\n100.0 100.0\n1 1 5 5\n0.0 0.0\n3.0 4.0\n",
      output: "1\n0\n",
    },
  ]);

  await seedFromSample("gpe-10505-center-of-masses", [
    { input: "3\n0 0\n4 0\n0 3\n1\n", output: "1.333 1.000\n" },
  ]);

  await seedFromSample("gpe-2009-17-binary-tree-traversals", [
    { input: "1\n1\nA\nA\n", output: "A\n" },
  ]);

  await seedFromSample("gpe-21964-fill-the-containers", [{ input: "3 5\n1 2 3\n", output: "3\n" }]);

  await seedFromSample("gpe-11184-opening-doors", [{ input: "1\n99\n0\n", output: "1\n81\n" }]);

  await seedFromSample("uva-382-perfection", [
    {
      input: "6 9 12 0\n",
      output: "PERFECTION OUTPUT\n    6  PERFECT\n    9  DEFICIENT\n   12  ABUNDANT\nEND OF OUTPUT\n",
    },
  ]);

  await seedFromSample("gpe-2015-02-recursion-and-mod", [
    { input: "1\n9223372036854775807\n", output: "1\n483623864\n" },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
