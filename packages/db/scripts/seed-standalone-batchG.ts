/**
 * Standalone (no-collection) UVA problems, batch G (7 problems).
 *
 * Every problem here had a from-scratch reference solution run against its full scraped Sample first
 * (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for a
 * boundary case.
 *
 * - uva-10740-first-love's official DB Sample.output is not real judge data at all: it's a scraper
 *   placeholder, literally the text "Please generate output by the sample code." Since there's no real
 *   expected output to verify against, this problem is seeded with sampleLimit:0, discarding the
 *   placeholder entirely, and using the problem statement's OWN fully-worked example instead: the text
 *   narrates 7 explicit path lengths from vertex 5 to vertex 2 in a specific (partially-described)
 *   graph, which were reverse-engineered into concrete edge weights by solving the implied system of
 *   equations (e.g. "5->1->2" length 5 and "5->1->2->5->1->2" length 14 together pin down the 2->5
 *   back-edge at weight 4, etc.) -- every one of the statement's 7 narrated path lengths was confirmed
 *   to be reproducible from the reconstructed graph before trusting it as ground truth. Algorithm:
 *   k-th shortest WALK (not simple path -- the statement's own example explicitly reuses a cycle) via
 *   a min-heap that keeps expanding a node's outgoing edges up to k times each (the standard technique
 *   for "k shortest walks with cycles allowed"), reporting the walk length the k-th time the target
 *   node is popped. Boundary case reuses the reconstructed graph directly (not fresh data) since it's
 *   already the most authoritative source available: k=5 (the statement's own headline case, "either
 *   ...each with length 15", a genuine tie for the 4th and 5th positions) and k=2 (6, the second listed
 *   path "5->4->3->2").
 *
 * - uva-10666-the-eurocup-is-here: optimistic classification = popcount(X)+1 -- derived by tracing the
 *   "who is guaranteed better than X" chain and discovering it's *exactly* the sequence produced by
 *   repeatedly clearing X's lowest set bit down to 0 (each clear-lowest-bit step is literally "the team
 *   that eliminates the current chain member," since the enclosing block's minimum for the next power
 *   of two is exactly X with its lowest set bit removed), so the chain length equals X's popcount.
 *   Pessimistic classification = 2^N - 2^r + 1, where r is X's trailing-zero count (X's own bracket of
 *   2^r-1 teams are the only ones definitely worse than it; treating X=0 as r=N handles the champion
 *   case with no special-casing needed). Verified both formulas against the FULL 18-case official
 *   sample (not just a couple of hand-traced cases -- initially derived optimistic as "N minus trailing
 *   zeros, plus 1" from only 2 cases, which happened to coincidentally match those 2 cases but was
 *   refuted by a 3rd case, forcing the correct popcount-based re-derivation). Boundary case is the
 *   smallest possible tournament, N=1 (2 teams): team 0 is unambiguously both best and worst-case rank
 *   1 (champion), team 1 is unambiguously rank 2 either way -- ground truth independent of either
 *   formula, from the trivial 2-team case having zero ranking ambiguity at all.
 * - uva-10672-marbles-on-a-tree (uvaId=10672, no vertex explicitly marked "root" in the input format --
 *   determined by finding the one vertex that never appears in any other vertex's children list):
 *   classic tree-DP result, the answer is the sum over every non-root edge of |subtreeMarbleSum -
 *   subtreeVertexCount| (the net flow of marbles that must cross that edge in either direction).
 *   Verified against the official sample, including confirming by hand that the sample's raw input has
 *   genuinely arbitrary embedded blank lines *inside* a single test case's data block (not just between
 *   test cases) -- handled correctly since parsing tokenizes the whole input ignoring all whitespace
 *   structure rather than relying on line-based test-case boundaries. Boundary case is the smallest
 *   nontrivial tree: root (0 marbles) with one child (2 marbles) -- exactly 1 move needed (shift one
 *   marble down to the root), obvious by inspection without needing the DFS/subtree-sum machinery.
 * - uva-10690-expression-again: since total sum S=sumX+sumY is fixed regardless of how the n+m numbers
 *   are partitioned into a size-n group X and size-m group Y, the product sumX*(S-sumX) is a concave
 *   function of sumX alone -- maximized when sumX is as close to S/2 as achievable (subject to the
 *   size-n constraint) and minimized at whichever extreme (smallest- or largest-achievable sumX) is
 *   furthest from S/2. Computed via an exact subset-sum reachability DP (bounded, since n+m<=100 and
 *   values are only -50..50) rather than a greedy sort, since achieving the closest-to-S/2 sum isn't
 *   always as simple as "biggest+smallest paired up." Verified against the official sample (many
 *   cases), including the problem statement's own worked example. Boundary case is the trivial n=m=1
 *   split of {3,7}: there's only one possible partition at all (one number per side), so max and min
 *   are forced to coincide at 21.
 * - uva-10721-bar-codes: DP over (bars used, units used so far), dp[i][j] = sum over bar-widths
 *   w in [1,m] of dp[i-1][j-w], using BigInt since the problem explicitly states results can reach the
 *   64-bit range. Verified against the official sample, including that BC(7,4,3)=16 matches the
 *   problem's own explicitly-enumerated figure of all 16 symbols. Boundary case is the smallest
 *   possible input, BC(1,1,1): a single 1-unit bar exactly covering 1 unit -- trivially exactly 1 way.
 * - uva-10763-foreign-exchange: a hashmap keyed by "origin,destination" counts each request, and the
 *   program works out iff, for every distinct (a,b) pair present, the count of (a,b) requests exactly
 *   equals the count of (b,a) requests. Verified against the official sample (a very large one, 500000
 *   candidates). Boundary case covers both branches on minimal input: one perfectly-matched pair
 *   (0->1 and 1->0, succeeds) and one lone unmatched request (0->1 with no reverse partner at all,
 *   fails) -- both obvious directly from the matching definition.
 * - uva-10789-prime-frequency: straightforward character-frequency counting per test string, filtering
 *   to characters whose frequency is prime, sorted by ASCII value, joined with no separator (or
 *   "empty" if none qualify) under a "Case N: ..." prefix. Verified against the official sample (20
 *   cases). Boundary case covers both output branches: "AABBC" (A and B both occur twice, a prime
 *   frequency, C once which isn't -- output "AB") and "ABC" (every character occurs exactly once, and
 *   1 is not prime by definition -- output "empty").
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample(
    "uva-10740-first-love",
    [
      {
        input: "5 6\n5 2 5\n5 1 2\n1 2 3\n5 4 2\n4 3 2\n3 2 2\n2 5 4\n0 0\n",
        output: "15\n",
      },
      {
        input: "5 6\n5 2 2\n5 1 2\n1 2 3\n5 4 2\n4 3 2\n3 2 2\n2 5 4\n0 0\n",
        output: "6\n",
      },
    ],
    0,
  );

  await seedFromSample("uva-10666-the-eurocup-is-here", [{ input: "2\n1 0\n1 1\n", output: "1 1\n2 2\n" }]);

  await seedFromSample("uva-10672-marbles-on-a-tree", [
    { input: "2\n1 0 1 2\n2 2 0\n0\n", output: "1\n" },
  ]);

  await seedFromSample("uva-10690-expression-again", [{ input: "1 1\n3 7\n", output: "21 21\n" }]);

  await seedFromSample("uva-10721-bar-codes", [{ input: "1 1 1\n", output: "1\n" }]);

  await seedFromSample("uva-10763-foreign-exchange", [
    { input: "2\n0 1\n1 0\n1\n0 1\n0\n", output: "YES\nNO\n" },
  ]);

  await seedFromSample("uva-10789-prime-frequency", [
    { input: "2\nAABBC\nABC\n", output: "Case 1: AB\nCase 2: empty\n" },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
