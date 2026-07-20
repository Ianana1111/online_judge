/**
 * Standalone (no-collection) UVA problems, batch E (7 problems).
 *
 * Every problem here had a from-scratch reference solution run against its full scraped Sample first
 * (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for a
 * boundary case. No corrupted samples found in this batch.
 *
 * - uva-10397-connect-the-campus: minimum spanning tree with a twist -- existing cables are
 *   zero-cost "free" edges (union-find pre-merges their endpoints before any new edge is considered),
 *   then Prim's algorithm runs over all N buildings, treating any pair already in the same
 *   union-find component as distance 0 (so the MST never re-pays for connectivity the existing
 *   cables already provide), summing only the cost of edges Prim's actually needs to add. Verified
 *   against the official sample (N up to 750). Boundary case is 2 buildings already directly cabled
 *   together: the union-find merges them before Prim's even starts, so the answer is 0.00 new cable
 *   regardless of their physical distance -- a fact independent of the MST algorithm itself.
 * - uva-10407-simple-division: the largest d such that every number in the sequence leaves the same
 *   remainder mod d is exactly gcd of all pairwise differences (equivalently, gcd of every element's
 *   difference from the first element) -- a standard number-theory fact, not something that needs the
 *   MST-style code to "discover." Verified against the full official sample (many sequences).
 *   Boundary case is {5,9,17}: differences from 5 are 4 and 12, gcd(4,12)=4, and indeed 5,9,17 all
 *   leave remainder 1 when divided by 4 -- confirmed by direct division, not by trusting the gcd chain.
 * - uva-10443-rock-scissors-paper: cellular automaton where each cell simultaneously (using only the
 *   previous day's grid) converts to whichever single type beats its current type, if and only if
 *   that beating type occupies at least one of its 4 orthogonal neighbors -- there's never ambiguity
 *   about *which* type could convert a given cell, since for any type exactly one other type beats it.
 *   Verified against the official sample (2 test cases). Found the same "statement claims a blank
 *   line between test-case outputs, but the real sample has none" mismatch seen repeatedly elsewhere
 *   in this project -- trusted the sample. Boundary case is a trivial 1x1 grid: with no neighbors at
 *   all, the single cell can never be converted regardless of how many days pass, so it must stay 'R'
 *   unchanged after 5 days -- a fact independent of the day-by-day simulation loop.
 * - uva-10474-where-is-the-marble: sort the marbles once, then answer each query via binary search for
 *   the first (lowest-index) occurrence of that value. Verified against the official sample (large,
 *   ~65-case input). Boundary case covers both output branches on one tiny case: a marble that exists
 *   (found at its 1-indexed sorted position) and one that doesn't (not found), confirming the exact
 *   "CASE# k:" header format and both message templates.
 * - uva-10487-closest-sums: sort the set once, then answer each query via the standard sorted
 *   two-pointer sweep (moving the low pointer up when the current pair-sum is below the query, the
 *   high pointer down when above), which finds the closest achievable sum in O(n) per query. Verified
 *   against the full official sample (10 cases, up to 1000 numbers and many queries each) including
 *   its exact "Case N:" / "Closest sum to Q is S." format. Boundary case is a tiny set {1,2,3,100}
 *   queried at 5: 2+3=5 is an exact match, immediately verifiable by hand without needing to trust the
 *   two-pointer convergence logic on a larger set.
 * - uva-105-the-skyline-problem: coordinate-compressed sweep over all distinct x-coordinates, removing
 *   heights of buildings ending at each x before adding heights of buildings starting there (so a
 *   building's own end doesn't get double-counted against another building starting at the exact same
 *   x), tracking the currently "active" height multiset and emitting an (x, newHeight) breakpoint only
 *   when the running max height actually changes. Verified against the official sample (the problem's
 *   own canonical 8-building example, extended to 15 buildings in the real Sample). Boundary case is
 *   the simplest possible input, a single building (1,5,3): the skyline is trivially "1 5 3 0" (rise
 *   to height 5 at x=1, drop back to 0 at x=3), independent of the sweep/multiset machinery entirely.
 * - uva-10530-guessing-game: track the set of numbers in [1,10] consistent with every guess+response
 *   constraint seen so far in the current transcript (intersecting after each pair) -- Stan "may be
 *   honest" iff at least one fixed number could have produced every response in the game, and is
 *   "dishonest" iff the constraints are contradictory for every possible number. Verified against the
 *   full official sample (dozens of games). Boundary case is a self-contradictory 3-guess game: guess 3
 *   "too high" (secret<3) then guess 5 "too low" (secret>5) then guess 4 "right on" (secret==4) -- no
 *   single number can simultaneously be <3 and >5, so this is provably dishonest independent of the
 *   final "right on" guess, which is itself consistent in isolation (a genuinely tricky case since the
 *   contradiction comes from the *middle* two constraints, not the final guess).
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-10397-connect-the-campus", [
    { input: "2\n0 0\n3 4\n1\n1 2\n", output: "0.00\n" },
  ]);

  await seedFromSample("uva-10407-simple-division", [{ input: "5 9 17 0\n", output: "4\n" }]);

  await seedFromSample("uva-10443-rock-scissors-paper", [{ input: "1\n1 1 5\nR\n", output: "R\n" }]);

  await seedFromSample("uva-10474-where-is-the-marble", [
    { input: "1 2\n7\n7\n3\n0 0\n", output: "CASE# 1:\n7 found at 1\n3 not found\n" },
  ]);

  await seedFromSample("uva-10487-closest-sums", [
    { input: "4\n1\n2\n3\n100\n1\n5\n0\n", output: "Case 1:\nClosest sum to 5 is 5.\n" },
  ]);

  await seedFromSample("uva-105-the-skyline-problem", [{ input: "1 5 3\n", output: "1 5 3 0\n" }]);

  await seedFromSample("uva-10530-guessing-game", [
    { input: "3\ntoo high\n5\ntoo low\n4\nright on\n0\n", output: "Stan is dishonest\n" },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
