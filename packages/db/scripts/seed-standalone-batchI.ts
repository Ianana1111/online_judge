/**
 * Standalone (no-collection) UVA problems, batch I (6 of 7 problems; uva-1101-addmul deferred, see
 * below).
 *
 * - uva-1101-addmul was NOT seeded and is left with 0 TestCase rows. This is a genuinely hard
 *   combinatorial-search problem (find the shortest A(add)/M(multiply) program mapping every x in
 *   [p,q] into [r,s], tie-broken lexicographically): the official sample includes solutions needing
 *   over 17 million consecutive 'A' operations as a single run ("17390188A 1M"), so per-operation
 *   search is computationally infeasible -- runs must be reasoned about as whole (count, cost) edges.
 *   Several rounds of increasingly sophisticated candidate-run-length heuristics were tried (maximal
 *   safe push, minimal push to reach r, and per-future-multiplier-count exact-landing candidates) and
 *   still hit multi-million-node search blowups on the real sample's harder cases despite
 *   memoization and depth caps, without a rigorous proof of an optimal-substructure candidate set
 *   that's simultaneously correct and small enough to search. Rather than risk seeding subtly wrong
 *   "verified" data from an unproven heuristic, this problem is left unseeded -- since 0 TestCase rows
 *   routes it to the real UVa judge relay (apps/judge/src/worker.ts), it continues to work correctly
 *   for users; this is the same safe fallback already used for genuine special-judge problems
 *   elsewhere in this project, applied here to a problem that's hard for a different reason
 *   (correctness-under-tight-verification, not output-ambiguity).
 *
 * Every problem below had a from-scratch reference solution run against its full scraped Sample first
 * (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for a
 * boundary case. No corrupted samples found in this batch.
 *
 * - uva-10858-unique-factorization: recursive factor-tree enumeration (each factor >= the previous
 *   one, trying divisors in ascending order so factorizations come out already in dictionary order,
 *   the exact ordering asked for), excluding any factorization using 1 or having fewer than 2 factors.
 *   Verified against the official sample (N=20 -> the 3 factorizations 2 2 5 / 2 10 / 4 5, matching
 *   the problem's own worked example of 12=4x3=6x2 conceptually). Boundary case covers N=1 (0 ways,
 *   trivially -- there's no way to write 1 as a product of >=2 factors each >=2) and N=8 (2 ways: 2x2x2
 *   and 2x4, exhaustively enumerable by hand for a number this small).
 * - uva-10903-playing-war: tally wins/losses per player across all games (rock beats scissors beats
 *   paper beats rock), then win average w/(w+l) to 3 decimals, or '-' if w+l=0, with a blank line
 *   between test cases. Verified against the official sample (many players, many games). Boundary
 *   case is the smallest possible tournament, 2 players and a single game where player 1's rock beats
 *   player 2's scissors: player 1 gets a perfect 1.000 average, player 2 a perfect 0.000 -- both
 *   trivially checkable by hand from the single game's outcome.
 * - uva-10921-find-the-telephone: direct character-by-character letter-to-digit substitution via the
 *   standard phone keypad table, passing hyphens and the digits 1/0 through unchanged while counting
 *   letters and hyphens separately. Verified against the official sample (9 varied expressions,
 *   including one that's entirely hyphens with no letters, and one with no hyphens at all). Boundary
 *   case is a short hand-computable expression "AB-10": A->2, B->2, hyphen and the literal digits 1,0
 *   pass through unchanged, giving "22-10" with 2 letters and 1 hyphen.
 * - uva-11000-the-four-in-one-stadium: reverse-engineered the exact bee-population recurrence from the
 *   official sample's own numbers (not just the ambiguous prose) by tabulating males(n) and total(n)
 *   and spotting that males(n) equals total(n-1) exactly, and that total(n)-males(n) (the count of all
 *   female bees, including the immortal one) is exactly the Fibonacci sequence -- giving the clean
 *   recurrence total(n) = total(n-1) + Fib(n) with Fib(0)=Fib(1)=1, computed via BigInt. Verified
 *   against the full official sample (18 values). Boundary case is N=0: only the original immortal
 *   female bee exists yet (no births have happened), so 0 males and a total of 1 -- true by definition,
 *   independent of the derived recurrence.
 * - uva-11003-boxes: a naive "always pick the single best (highest-count) box to stack on" greedy DP
 *   is provably wrong here (verified empirically: it under-counts starting at the sample's 5th test
 *   case) because a subtower with a slightly worse count/weight trade-off can still enable a longer
 *   overall chain once combined with boxes further down, if it happens to weigh less. Fixed by tracking
 *   the full Pareto frontier per box (for every achievable stack-height above it, the minimum possible
 *   total weight), merging frontiers from every box that could sit above it within its max-load limit.
 *   Verified against the full official sample (10 cases, up to N=1000 boxes) after the fix. Boundary
 *   case is the simplest possible nontrivial stack: 2 boxes where the bottom box's max load
 *   comfortably exceeds the top box's weight -- both stack, answer 2, with no DP ambiguity possible
 *   with only one pair to consider.
 * - uva-11039-building-designing: since floors must appear in strictly size-descending order bottom to
 *   top, sorting all candidate floors by size descending first turns the problem into "the longest
 *   alternating-color subsequence of this fixed sequence," which is exactly the count of maximal
 *   same-color runs in that sorted order (greedily keep a floor whenever its color differs from the
 *   last one kept -- provably optimal, since no valid alternating subsequence can exceed the number of
 *   color-run boundaries in the sequence). Verified against the official sample (a very large ~6MB
 *   input). Boundary case is 3 floors already alternating in size-descending, color-alternating order
 *   (blue 30, red 20, blue 10) -- already fully valid as given, so the answer is trivially all 3,
 *   independent of the sort/run-counting machinery.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-10858-unique-factorization", [
    { input: "1\n8\n0\n", output: "0\n2\n2 2 2\n2 4\n" },
  ]);

  await seedFromSample("uva-10903-playing-war", [
    { input: "2 1\n1 rock 2 scissors\n0\n", output: "1.000\n0.000\n" },
  ]);

  await seedFromSample("uva-10921-find-the-telephone", [{ input: "AB-10\n", output: "22-10 2 1\n" }]);

  await seedFromSample("uva-11000-the-four-in-one-stadium", [{ input: "0\n-1\n", output: "0 1\n" }]);

  await seedFromSample("uva-11003-boxes", [{ input: "2\n1 100\n50 10\n0\n", output: "2\n" }]);

  await seedFromSample("uva-11039-building-designing", [
    { input: "1\n3\n30\n-20\n10\n", output: "3\n" },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
