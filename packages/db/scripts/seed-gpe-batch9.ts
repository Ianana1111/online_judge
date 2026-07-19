/**
 * gpe-history collection, batch 9 (7 problems).
 *
 * Every problem here had a from-scratch reference solution run against its full scraped Sample
 * first (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for
 * a boundary case.
 *
 * - gpe-10606-how-big-is-it (uva-10012): minimum-width bottom-touching circle-packing. Brute-forces
 *   all m! permutations (m<=8) with the standard greedy placement (each new circle's x-coordinate is
 *   the max, over all already-placed circles, of the horizontal offset 2*sqrt(r_i*r_j) needed to make
 *   it tangent). Verified against all 3 official lines exactly, including the same-radius case
 *   (4 circles of radius 2 -> width 16, a clean sanity check: n equal circles in a row space out by
 *   exactly 2r each). Boundary case adds the trivial single-circle case (width = 2r) and two equal
 *   circles (width = 2*(r1+r2) for equal radii, independently reasoned, not just code-trusted).
 * - gpe-2008-28-longest-monotonically-increasing-subsequence (uvaId=null, no external oracle): this
 *   problem asks for *all* longest increasing subsequences, printed in one specific canonical order —
 *   getting that order right (not just the count/lengths) took real reverse-engineering. Computed
 *   up[i] = length of the longest increasing subsequence *starting* at index i (looking forward), then
 *   enumerate via depth-first search trying next-candidates in ascending *original index* order at
 *   each branch point, requiring up[candidate] == remaining length, fully exhausting one branch before
 *   the next sibling. Hand-traced this completely against the second official test pattern (9
 *   elements, 5 resulting length-4 sequences with a non-obvious interleaved order across two starting
 *   points) and it matched exactly, step by step — not just "ran the code and it matched," the branch
 *   structure was manually re-derived and cross-checked. Boundary case adds the trivial n=1 case and a
 *   5-element input with a genuine 2-way branch to re-exercise the exact ascending-index tie-break.
 * - gpe-10637-tight-words (uva-10081): DP count of words where every adjacent digit pair differs by
 *   at most 1, over BigInt (n up to 100, k up to 9 alphabet symbols), formatted as a percentage with
 *   5 fractional digits via scaled BigInt division (not floating point, to avoid precision loss at
 *   n=100). Verified against all 4 official values. Boundary case's third value (k=9, n=3) was cross-
 *   checked via a *completely independent* brute-force enumeration of all 1000 words (not the DP) —
 *   got 80/1000 = 8.00000%, confirming the DP matches — plus k=1 at n=100 (binary alphabet: any two
 *   adjacent bits differ by at most 1 by definition, so it's *always* 100% regardless of length, a
 *   fact reasoned from the problem definition, not computed) to stress BigInt magnitude at the upper
 *   bound without relying on the DP path alone.
 * - gpe-23681-bachet-s-game (uva-10404): Sprague-Grundy win/lose DP for a Nim-like subtraction game
 *   with an arbitrary move set (must include 1). Verified against all 6 official lines (including the
 *   large n=1000000 cases, run directly — same O(n*m) DP, ~35ms). Boundary case deliberately avoids
 *   the trivial "just take everything in one move" case and uses n=5, moves={1,4}: neither of Stan's
 *   two opening moves (leaving 4 or 1) reaches a losing position for Ollie, so Ollie wins despite Stan
 *   moving first — hand-traced the full 5-position game tree to confirm before trusting it.
 * - gpe-10559-i-love-big-numbers (uva-10220): BigInt factorial + digit sum. Boundary case is n=0
 *   (0! = 1 by definition, digit sum 1 — a fact independent of any factorial-computation code path)
 *   and n=1000 (the stated upper bound, straightforward BigInt arithmetic with no alternate reading).
 * - gpe-10732-snow-clearing (uva-10203): every street contributes two directed lanes (one each
 *   direction) between the same two points, which makes the directed multigraph automatically
 *   in-degree == out-degree at every vertex — i.e. always Eulerian given the stated connectivity
 *   guarantee — so the "50 km/h on already-plowed lanes" detail in the statement is a red herring:
 *   the answer is always just (2 * total street length) / 20 km/h, rounded to the nearest minute, with
 *   zero backtracking ever required. Confirmed this by hand-computing the official sample's 3 streets
 *   independently (14142.135 + 20000 + 5000 = 39142.135m, doubled and divided by 20km/h = 3.914h =
 *   3:55) before trusting the code. Also found the same "statement claims a blank-line-delimited
 *   format, real sample has none" issue seen elsewhere in this collection — the reference (and this
 *   boundary case) only handles T=1, the only format actually evidenced by real data, matching the
 *   precedent already set for gpe-10429-contest-scoreboard. Boundary case is a single 5000m street:
 *   exactly 30 minutes round trip, chosen to land precisely on a round number rather than something
 *   requiring trust in the rounding logic at a fractional boundary.
 * - gpe-10610-curling-up-the-cube (uva-10024): cube-net validity check via rolling-die simulation
 *   (reusing the exact same roll-state mechanics as uva-10409-die-game from the CPE-49 batch): BFS
 *   over the connected paper squares, rolling a cube state through each grid step, and checking all 6
 *   squares end up mapped to 6 *distinct* physical faces. Verified against both official cases
 *   (a cross-shaped net -> correct, a zigzag/staircase-adjacent shape -> incorrect). Boundary case
 *   uses two well-known textbook facts about the 11 valid cube hexomino nets (out of 35 total
 *   hexominoes) as independent verification, not just algorithmic self-consistency: a straight line of
 *   6 squares is never a valid net (opposite faces would collide) -> incorrect; a diagonal staircase
 *   is one of the 11 valid nets -> correct.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("gpe-10606-how-big-is-it", [{ input: "2\n1 5.0\n2 3.0 3.0\n", output: "10.000\n12.000\n" }]);

  await seedFromSample("gpe-2008-28-longest-monotonically-increasing-subsequence", [
    { input: "2\n1\n42\n5\n1 3 2 4 5\n", output: "1\n42\n2\n1 3 4 5\n1 2 4 5\n" },
  ]);

  await seedFromSample("gpe-10637-tight-words", [{ input: "0 5\n1 100\n9 3\n", output: "100.00000\n100.00000\n8.00000\n" }]);

  await seedFromSample("gpe-23681-bachet-s-game", [{ input: "1 1 1\n5 2 1 4\n", output: "Stan wins\nOllie wins\n" }]);

  await seedFromSample("gpe-10559-i-love-big-numbers", [{ input: "0\n1000\n", output: "1\n10539\n" }]);

  await seedFromSample("gpe-10732-snow-clearing", [{ input: "1\n0 0\n0 0 5000 0\n", output: "0:30\n" }]);

  await seedFromSample("gpe-10610-curling-up-the-cube", [
    {
      input:
        "2\n0 0 0 0 0 0\n1 1 1 1 1 1\n0 0 0 0 0 0\n0 0 0 0 0 0\n0 0 0 0 0 0\n0 0 0 0 0 0\n1 0 0 0 0 0\n1 1 0 0 0 0\n0 1 1 0 0 0\n0 0 1 0 0 0\n0 0 0 0 0 0\n0 0 0 0 0 0\n",
      output: "incorrect\ncorrect\n",
    },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
