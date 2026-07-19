/**
 * gpe-history collection, batch 1 (8 problems).
 *
 * Starts the second phase of test-data coverage: gpe-history has 115 problems, 12 already covered
 * via overlap with the completed cpe-basic-49 collection, leaving 103. This batch picks 8 of the
 * remaining ones, each with a from-scratch reference solution run against its full scraped Sample
 * first (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for
 * a boundary case. Two problems with zero scraped samples (gpe-10679-irreducible-basic-fractions,
 * gpe-10600-network-connections) and one with no uvaId / no canonical external judge to check
 * against (gpe-2008-37-prefix-expression-evaluation) are deliberately excluded from this batch and
 * left for later, dedicated handling.
 *
 * - uva-10110-light-more-light: the input format has no count/terminator structure beyond a
 *   trailing 0 — samples are just bare n values. Confirmed the "bulb n ends on iff n is a perfect
 *   square" classic result against all 3 sample values (3->no, 6241=79^2->yes, 8191 prime->no).
 *   Boundary case pushes to the stated 2^32-1 upper bound using BigInt arithmetic (integer sqrt via
 *   Newton's method) to avoid float-precision sqrt errors near that range: 65535^2=4294836225->yes,
 *   2^32-1=4294967295->no (one more than 65536^2).
 * - gpe-22351-quirksome-squares: verified the classic 4-digit quirksome set {0000, 0001, 2025, 3025,
 *   9801} independently matches a well-known math fact before trusting it as the boundary case for
 *   N=4 (the sample only exercises N=2).
 * - uva-532-dungeon-master: 3D 6-directional BFS. Sample input/output matched exactly (large multi-
 *   dungeon sample). Boundary case exercises both outcomes with minimal grids: a 1x1x2 "SE" corridor
 *   (Escaped in 1 minute(s).) and a 1x1x3 "S#E" corridor with the only path blocked by rock
 *   (Trapped!) — this project's own dump/blank-line-filtering approach for parsing the "one blank
 *   line after each level" input format was cross-checked against the real sample before trusting it
 *   for the hand-built boundary.
 * - gpe-11009-all-in-all: case-sensitive subsequence check. Boundary case adds an s longer than t
 *   (must short-circuit to "No") and s === t (must still walk the full match, not just a prefix
 *   check, to get "Yes").
 * - gpe-10501-safe-salutations: confirmed Catalan(4)=14 matches the one official sample. Boundary
 *   case exercises n=1 (Catalan(1)=1, the smallest allowed n) and n=10 (Catalan(10)=16796, the
 *   stated upper bound) together in one input, which also exercises the "print a blank line between
 *   datasets" output rule the single-dataset sample never triggers.
 * - gpe-11192-simple-minded-hashing: subset-sum DP over the 26 lowercase letters (strictly ascending
 *   letters map 1:1 to subsets, since ascending order is the only valid order for a fixed subset).
 *   Boundary case checks L=1,S=1 (the single-letter 'a', smallest case), L=26,S=351 (the entire
 *   alphabet used at once, sum of 1..26, exactly 1 way), and L=1,S=9999 (S far exceeds what any
 *   single letter can sum to -> 0, guards against a DP that forgets to bound S against the true
 *   26-letter max instead of the stated but structurally-unreachable S<10000 limit).
 * - gpe-22821-oil-deposits: 8-directional flood-fill component count. Boundary case is a 2x2
 *   diagonal-only pair ("@*" / "*@") that must still count as a single deposit — the most commonly
 *   missed part of this problem and not exercised by the official sample's larger grids in isolation
 *   from other adjacency types.
 * - gpe-10655-sumsets: brute-force 3-sum-equals-4th-distinct-element search (fine for hand-authored
 *   boundary sizes; the sample's n<=5 keeps this uncontroversial). Boundary case uses negative
 *   numbers and a set where the correct answer (0, from -5 + -3 + 8) is *not* the largest element in
 *   the set (100 is present but unreachable by any triple) — guards against an implementation that
 *   only ever checks the global max as a candidate d instead of searching all of them.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-10110-light-more-light", [
    { input: "1\n4294836225\n4294967295\n0\n", output: "yes\nyes\nno\n" },
  ]);

  await seedFromSample("gpe-22351-quirksome-squares", [{ input: "4\n", output: "0000\n0001\n2025\n3025\n9801\n" }]);

  await seedFromSample("uva-532-dungeon-master", [
    { input: "1 1 2\nSE\n\n1 1 3\nS#E\n\n0 0 0\n", output: "Escaped in 1 minute(s).\nTrapped!\n" },
  ]);

  await seedFromSample("gpe-11009-all-in-all", [{ input: "abcde abc\nabcabc abcabc\n", output: "No\nYes\n" }]);

  await seedFromSample("gpe-10501-safe-salutations", [{ input: "1\n\n10\n", output: "1\n\n16796\n" }]);

  await seedFromSample("gpe-11192-simple-minded-hashing", [
    { input: "1 1\n26 351\n1 9999\n0 0\n", output: "Case 1: 1\nCase 2: 1\nCase 3: 0\n" },
  ]);

  await seedFromSample("gpe-22821-oil-deposits", [{ input: "2 2\n@*\n*@\n0 0\n", output: "1\n" }]);

  await seedFromSample("gpe-10655-sumsets", [
    { input: "5\n-5\n-3\n0\n8\n100\n3\n1\n2\n3\n0\n", output: "0\nno solution\n" },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
