/**
 * gpe-history collection, batch 2 (7 problems; 8th candidate deliberately excluded, see below).
 *
 * - gpe-10658-is-bigger-smarter (uva-10131) was pulled from this batch entirely and left with 0
 *   TestCase rows on purpose. Its own problem statement says "There may be many correct outputs for
 *   a given input, your program only needs to find one" — it's a special-judge problem on the real
 *   UVA judge (checks only that the printed sequence is a valid longest weight-increasing/IQ-
 *   decreasing subsequence, not that it matches one specific answer). This repo's checkerType enum
 *   has a SPECIAL value but apps/judge/src/local/checkers.ts's checkOutput() still throws "SPECIAL
 *   checkerType has no local judge implementation yet" for it — so seeding an exact-diff TestCase
 *   here would fail every other equally-valid correct submission. Left alone, it keeps relaying to
 *   the real UVA judge (which does special-judge this correctly) until local special-judge support
 *   exists.
 * - uva-10405-longest-common-subsequence (slug/title fixed in this batch — was previously stored as
 *   "uva-10405-jolly-jumpers", a scraping mismatch: UVA 10038 is the real Jolly Jumpers, and 10405's
 *   statementMd was genuinely "Longest Common Subsequence" all along) had a second, unrelated bug:
 *   the scraped Sample itself is corrupted. It claims LCS("abcdgh","aedfhr") = 4, which
 *   contradicts the problem statement's own worked example (explicitly says that LCS is "adh",
 *   length 3) — confirmed via two independent from-scratch LCS DP implementations, both giving 3,
 *   not 4. So the scraped Sample is discarded outright (sampleLimit: 0, matching the precedent this
 *   project already established for e.g. uva-11005) and every TestCase row here is hand-verified
 *   instead, anchored on the statement's own trusted worked example.
 * - gpe-11041-children-s-game: verified the "a+b vs b+a" concatenation comparator against all 3
 *   sample cases. Boundary case adds a leading-zero-prefixed-looking pair ("34" vs "3") where a
 *   naive numeric or plain-lexicographic sort gives the wrong order ("334" instead of the correct,
 *   larger "343") to confirm the comparator is doing real string-concatenation comparison.
 * - gpe-10533-the-trip: this one had a real trap. The naive approach (target = continuous average,
 *   money moved = sum of |amount-avg|/2) gives $12.00 for the sample's second dataset — but the
 *   correct, official answer is $11.99. The actual rule: split into floor(total/n) and
 *   floor(total/n)+1 targets (R = total mod n students get the +1), and critically the +1 target
 *   must go to the R *largest* amounts specifically (not an arbitrary assignment) to minimize total
 *   money moved — confirmed by matching the official sample only after adding that "assign extra
 *   cent to the largest amounts" rule. Boundary case re-exercises this with fresh numbers (a
 *   different remainder-producing set) plus the trivial n=1 case.
 * - gpe-10465-necklace: block-cut-tree / biconnected-components problem — a cycle exists between S
 *   and T iff every biconnected component on their tree path has edge-count == vertex-count (which
 *   correctly captures simple cycles AND multigraph digons alike, while correctly rejecting bridges,
 *   verified against all 3 of this problem's own official cases, which happen to already exercise
 *   parallel/duplicate edges). Multigraph correctness matters here: the biconnected-components DFS
 *   must exclude only the specific parent *edge* (by id), not the parent *vertex*, or true 2-cycles
 *   formed by parallel edges get silently treated as bridges. Boundary case adds a genuinely new
 *   shape not in the sample (a square 4-cycle chained to a triangle through one shared vertex, i.e.
 *   a real 2-cycle necklace with a non-triangle ring) plus a disconnected-graph "NO" case.
 * - gpe-24931-extend-to-palindromes: find the longest palindromic *suffix* of s, then append the
 *   reverse of everything before it. Boundary case checks case-sensitivity specifically (the
 *   statement never says to fold case, and "Aa" is not a palindrome under case-sensitive comparison
 *   even though "aa" would be) alongside the single-character trivial case.
 * - gpe-23671-camel-trading: interval DP over min/max value per subexpression, combining child
 *   results through all four max/min pairings at each split (not just max*max/min*min) since that's
 *   the only way the DP stays correct in general, even though this problem's own always-positive
 *   operands mean the cross terms never actually win here. Boundary case adds the trivial
 *   single-number (no operator) case and a small expression exercising a real fold contest between
 *   summing first vs. multiplying first.
 * - gpe-10551-bee-maja: hex-spiral coordinate numbering. The official sample only pins down ring 0
 *   (n=1) and 4 of ring 1's 6 cells (n=2..5) directly. The remaining two ring-1 values (n=6, n=7)
 *   are derived here by pure elimination + adjacency, not by guessing a general multi-ring rotation
 *   formula: ring 1 must consist of exactly the six unit hex-neighbors of the origin, four of which
 *   the sample already names, and consecutive spiral numbers must always be geometrically adjacent —
 *   that pins n=6 and n=7 uniquely. Deliberately did NOT attempt a ring-2+ boundary case: the
 *   general per-ring turning rule couldn't be pinned down with confidence from this little sample
 *   data (early attempts to fit a constant-rotation model produced self-contradictory results), and
 *   guessing would risk shipping a wrong "verified" boundary case, which is worse than a smaller one.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("gpe-11041-children-s-game", [{ input: "1\n5\n2\n34\n3\n0\n", output: "5\n343\n" }]);

  await seedFromSample("gpe-10533-the-trip", [
    { input: "1\n500.00\n3\n1.00\n2.00\n2.03\n0\n", output: "$0.00\n$0.67\n" },
  ]);

  await seedFromSample("gpe-10465-necklace", [
    {
      input: "6 7\n1 2\n2 3\n3 4\n4 1\n4 5\n5 6\n6 4\n1 6\n6 6\n1 2\n2 3\n3 1\n4 5\n5 6\n6 4\n1 4\n0 0\n",
      output: "Case 1: YES\nCase 2: NO\n",
    },
  ]);

  await seedFromSample(
    "uva-10405-longest-common-subsequence",
    [{ input: "abcdgh\naedfhr\nhello\nhello\nabc\nxyz\n", output: "3\n5\n0\n" }],
    0,
  );

  await seedFromSample("gpe-24931-extend-to-palindromes", [{ input: "a\nAa\nAbA\n", output: "a\nAaA\nAbA\n" }]);

  await seedFromSample("gpe-23671-camel-trading", [
    { input: "2\n7\n2+3*2+3\n", output: "The maximum and minimum are 7 and 7.\nThe maximum and minimum are 25 and 11.\n" },
  ]);

  await seedFromSample("gpe-10551-bee-maja", [{ input: "6\n7\n", output: "1 -1\n1 0\n" }]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
