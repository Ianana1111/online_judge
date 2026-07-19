/**
 * gpe-history collection, batch 3 (7 problems).
 *
 * - gpe-2015-03-sudoku-as-good-as-lee-hsien-loong (uvaId=null, no external oracle beyond this DB's
 *   own statement+sample): standard backtracking Sudoku solver, correctness here doesn't depend on
 *   an external source since Sudoku rules are unambiguous. Verified against both puzzles in the
 *   official sample (one solvable with a specific unique grid, one unsolvable -> "NO"). Boundary
 *   case sticks to puzzles with a *guaranteed unique* solution (an already-fully-filled valid grid,
 *   and that same grid with exactly one cell blanked) rather than anything under-constrained, since
 *   the problem itself guarantees inputs never have multiple solutions and a boundary case that
 *   violated that would be genuinely ambiguous test data.
 * - gpe-2008-19-set-partition (uvaId=null): the scraped statementMd lost its actual math formula
 *   during scraping ("count the number of ⟨blank⟩ such that ⟨blank⟩") — the criterion itself is
 *   missing from the text entirely. Reverse-engineered from the sample instead: hypothesized "count
 *   subsets summing to exactly half the total set sum," brute-forced it, and it reproduced the
 *   sample's specific list of 8 subsets *in the exact stated sort order* (by size, then by
 *   lexicographically-smallest elements) — matching such a specific ordered list by coincidence
 *   under a wrong hypothesis is implausible, so this is trusted despite the missing formula text.
 *   One real formatting gap found this way: the statement's "separate cases with a blank line" rule
 *   needed an actual blank line between cases (confirmed by first getting a one-line diff against
 *   the sample without it). Boundary case is a small hand-verified set ({1,2,3}, half-sum target 3)
 *   plus an odd-total-sum set ({1,2,4}) that's trivially unsatisfiable since no integer subset can
 *   sum to a non-integer half.
 * - gpe-10608-minimal-coverage (uva-10020): standard greedy interval cover (repeatedly extend
 *   current coverage using the eligible segment reaching furthest right). Found a real
 *   statement/sample mismatch here: the statement says to "print a blank line between the outputs
 *   for two consecutive test cases," but the official sample has NO blank line between its two
 *   cases — trusted the sample (what the real judge actually does) over the statement wording, which
 *   has other rough-translation artifacts elsewhere in the same paragraph. Boundary case needs 3
 *   greedy picks and specifically exercises "always take the eligible segment with the furthest
 *   right end," not first-fit.
 * - gpe-23651-the-jackpot (uva-10684): textbook Kadane's max-subarray-sum, printing "Losing streak."
 *   when the best subarray sum is <= 0. Boundary case covers the N=1 edge in both directions (single
 *   positive bet, single negative bet).
 * - uva-11639-guard-the-land: pure rectangle-intersection geometry (strongly secured = intersection
 *   area, weakly = area1+area2-2*intersection, unsecured = 10000-union). Verified against all 96
 *   nights in the official sample, not just night 1. Boundary case covers two shapes the sample's
 *   96 random pairs don't isolate cleanly: zero overlap, and one guard's rectangle fully containing
 *   the other's (including the degenerate case where one guard covers the whole 100x100 land).
 * - gpe-24461-sum-of-consecutive-prime-numbers (uva-1210): sieve + two-pointer sliding window over
 *   the prime list, counting windows summing to each query. Verified against all 8 sample queries,
 *   including the trickier ones (41 -> 3 representations, 53 -> 2). Boundary case checks n=2 (the
 *   stated lower bound, trivially itself) and n=10000 (the stated upper bound).
 * - gpe-10602-longest-paths (uva-10000): DAG longest-path DP from the start node, with a tie-break
 *   rule (smallest finishing node among equal-length longest paths) that's easy to get subtly wrong.
 *   Verified against all 3 official cases, including case 3's genuine tie between two length-2
 *   paths. Boundary case goes further than the sample does: it's built so the smallest-numbered
 *   *immediate* child (2, via 1->2->9) leads to the *larger* final endpoint (9), while the
 *   larger-numbered immediate child (3, via 1->3->4) leads to the smaller endpoint (4) — this only
 *   passes if the tie-break genuinely propagates the smallest *final* endpoint through the whole
 *   chain, not just the smallest immediate child, which the sample alone doesn't rule out.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("gpe-2015-03-sudoku-as-good-as-lee-hsien-loong", [
    {
      input:
        "2\n" +
        "5 3 4 6 7 8 9 1 2\n6 7 2 1 9 5 3 4 8\n1 9 8 3 4 2 5 6 7\n8 5 9 7 6 1 4 2 3\n4 2 6 8 5 3 7 9 1\n7 1 3 9 2 4 8 5 6\n9 6 1 5 3 7 2 8 4\n2 8 7 4 1 9 6 3 5\n3 4 5 2 8 6 1 7 9\n" +
        "0 3 4 6 7 8 9 1 2\n6 7 2 1 9 5 3 4 8\n1 9 8 3 4 2 5 6 7\n8 5 9 7 6 1 4 2 3\n4 2 6 8 5 3 7 9 1\n7 1 3 9 2 4 8 5 6\n9 6 1 5 3 7 2 8 4\n2 8 7 4 1 9 6 3 5\n3 4 5 2 8 6 1 7 9\n",
      output:
        "5 3 4 6 7 8 9 1 2\n6 7 2 1 9 5 3 4 8\n1 9 8 3 4 2 5 6 7\n8 5 9 7 6 1 4 2 3\n4 2 6 8 5 3 7 9 1\n7 1 3 9 2 4 8 5 6\n9 6 1 5 3 7 2 8 4\n2 8 7 4 1 9 6 3 5\n3 4 5 2 8 6 1 7 9\n" +
        "5 3 4 6 7 8 9 1 2\n6 7 2 1 9 5 3 4 8\n1 9 8 3 4 2 5 6 7\n8 5 9 7 6 1 4 2 3\n4 2 6 8 5 3 7 9 1\n7 1 3 9 2 4 8 5 6\n9 6 1 5 3 7 2 8 4\n2 8 7 4 1 9 6 3 5\n3 4 5 2 8 6 1 7 9\n",
    },
  ]);

  await seedFromSample("gpe-2008-19-set-partition", [
    { input: "{1 2 3}\n{1 2 4}\n.\n", output: "2 subsets.\n{3}\n{1 2}\n\nNo such subset\n" },
  ]);

  await seedFromSample("gpe-10608-minimal-coverage", [
    { input: "1\n10\n0 3\n0 5\n4 8\n7 10\n2 6\n0 0\n", output: "3\n0 5\n4 8\n7 10\n" },
  ]);

  await seedFromSample("gpe-23651-the-jackpot", [{ input: "1\n5\n1\n-3\n0\n", output: "The maximum winning streak is 5.\nLosing streak.\n" }]);

  await seedFromSample("uva-11639-guard-the-land", [
    {
      input: "2\n0 0 10 10\n20 20 30 30\n0 0 100 100\n40 40 60 60\n",
      output: "Night 1: 0 200 9800\nNight 2: 400 9600 0\n",
    },
  ]);

  await seedFromSample("gpe-24461-sum-of-consecutive-prime-numbers", [{ input: "2\n10000\n0\n", output: "1\n0\n" }]);

  await seedFromSample("gpe-10602-longest-paths", [
    {
      input: "9\n1\n1 2\n1 3\n2 9\n3 4\n0 0\n0\n",
      output: "Case 1: The longest path from 1 has length 2, finishing at 4.\n",
    },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
