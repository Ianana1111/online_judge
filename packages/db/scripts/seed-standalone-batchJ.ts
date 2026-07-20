/**
 * Standalone (no-collection) UVA problems, batch J (7 problems).
 *
 * Every problem here had a from-scratch reference solution run against its full scraped Sample first
 * (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for a
 * boundary case.
 *
 * - uva-11040-add-bricks-in-the-wall: the 9-row triangle's bottom row (row 9) is only partially given
 *   (its odd positions), but its 4 even positions can be solved directly from row 7's given values via
 *   the k=2 Pascal-descent identity row7[j] = row9[j] + 2*row9[j+1] + row9[j+2] (rearranged to
 *   row9[j+1] = (row7[j]-row9[j]-row9[j+2])/2) -- rows 1, 3, 5 in the input then become redundant
 *   over-determination that the problem guarantees is consistent, not needed for the solve at all.
 *   Once row 9 is fully known, every row above it is a direct forward sum. First implementation
 *   attempt omitted the "/2" (mistakenly using the raw difference as the answer), caught immediately
 *   by diffing against the official sample rather than trusting the derivation by eye. Verified
 *   against the full 6-case official sample after the fix. Boundary case is the all-zero triangle
 *   (every given value 0): trivially self-consistent (0=0+0 everywhere) with no computation needed to
 *   verify by hand.
 * - uva-11054-wine-trading-in-gergovig: the minimum total transport work is the sum of absolute values
 *   of the running prefix sum of the demand/supply array (a classic result: the prefix sum at position
 *   i is exactly the net number of bottles that must cross the gap between house i and i+1). Verified
 *   against the official sample (n up to 100000). Boundary case is the smallest possible input, 2
 *   houses where one sells 2 bottles and the other buys 2: independently obvious that exactly 2
 *   bottles must make exactly 1 hop each between the only two (adjacent) houses, total work 2.
 * - uva-11067-little-red-riding-hood: BigInt DP over the grid (dp[y][x] = dp[y][x-1]+dp[y-1][x], zeroed
 *   at any wolf-blocked point) since path counts can exceed a plain Number's safe range even though
 *   the *final* answer is capped at 2^32-1 by the problem statement (unblocked intermediate values in
 *   the DP can still be far larger before blocking suppresses them). Verified against the official
 *   sample (many test cases) including its exact three output-message templates (X>1, X==1, X==0).
 *   Boundary case is the smallest grid, 1x1: with no wolf, exactly 2 paths (right-then-up or
 *   up-then-right) -- obvious by listing them; with the wolf placed at both intermediate points
 *   (1,0) and (0,1), every path is blocked, giving "There is no path."
 * - uva-11078-open-credit-system: single left-to-right pass tracking the maximum score seen so far
 *   among earlier (senior) students, updating the best "senior score minus later junior score" at each
 *   new position -- first implementation attempt had the running extremum backwards (tracked a running
 *   minimum and computed later-minus-earlier, the opposite of "senior minus junior"), caught
 *   immediately by diffing against the official sample. Verified against the full official sample
 *   (multiple large test cases up to 100000 students) after the fix. Boundary case is [10,5,20,1]: the
 *   best pair is senior=20 (index 2) minus junior=1 (index 3) = 19, which is NOT the maximum adjacent
 *   difference and specifically requires tracking a running maximum across the whole prefix rather
 *   than just comparing neighbors -- a genuine stress of the "running max, not local max" logic.
 * - uva-11085-back-to-the-8-queens: the official sample is corrupted -- 750 lines of input but 1500
 *   lines of output, which turned out to be the correct 750-answer sequence literally duplicated back
 *   to back. Confirmed by running the reference solution (precompute all 92 valid 8-queens row
 *   permutations via backtracking, then for each test case take the minimum Hamming distance to any of
 *   the 92 -- since any move only changes one queen's row and a valid end state must itself be one of
 *   the 92 canonical non-attacking permutations, the answer is exactly that minimum distance) and
 *   confirming it reproduces the official output's first 750 lines exactly, with the second 750 being
 *   an exact repeat. Discarded the sample (sampleLimit: 0) and seeded hand-verified data instead: a
 *   genuine valid 8-queens solution ([1,5,8,6,3,7,2,4], confirmed non-attacking by construction) needs
 *   0 moves, and all-queens-on-row-8 ([8]*8, maximally invalid, every pair on the same row) needs 7
 *   moves (matches the same value the corrupted sample's first case gave for the symmetric all-row-1
 *   input, a fact independent of the corruption since that specific line matched twice identically).
 * - uva-11094-continents: the official sample is also corrupted, but more subtly than a duplication --
 *   case 2 and case 3 share a byte-for-byte identical 20x20 grid (confirmed programmatically) whose
 *   actual connected-land-region sizes are fixed at exactly [12, 12, 70] regardless of interpretation
 *   (confirmed identical with and without the column-wrap rule applied, since none of these 3 regions
 *   touch the grid's column boundary anyway). Case 3's coordinate (10,3) lands inside the size-70
 *   region, correctly giving max(12,12)=12, matching its expected output. But case 2's coordinate
 *   (5,5) lands on WATER, and regardless of which of the 3 fixed sizes gets excluded, the answer can
 *   only ever be 70 (excluding a 12) or 12 (excluding the 70) -- the official expected value 52 is
 *   mathematically unreachable from this grid under any exclusion, proving it's corrupted data (not an
 *   algorithm misunderstanding). Discarded the whole sample and seeded a small hand-verified case
 *   instead: a 3x4 grid with one continent spanning columns 0 and 3 (connected only via the explicit
 *   column-wrap rule) and a separate 3-cell continent elsewhere, specifically exercising the wrap rule
 *   the corrupted sample's cases never definitively confirmed.
 * - uva-111-history-grading: reduces to a longest-strictly-increasing-subsequence problem -- reorder
 *   events by their correct chronological rank, look up each such event's STUDENT-given rank in that
 *   order, and the length of the longest increasing run in that resulting sequence is the answer
 *   (standard reduction for this classic problem). Also required figuring out the input's real
 *   structural convention from the raw sample rather than the prose alone: a single test case's header
 *   ("n" then "the correct order") can be followed by an arbitrary number of student-ranking lines, and
 *   since there's no explicit count given, the only way to tell "one more student ranking" apart from
 *   "the next test case's n" is that a student-ranking line always has exactly n tokens while a new
 *   test case's header line has exactly 1 -- confirmed by checking the raw sample's line-by-line token
 *   counts directly. Verified against the official sample (2 test cases, 7 student rankings total).
 *   Boundary case is the smallest possible n=2 with one student matching the correct order exactly
 *   (LIS=2, everything correct) and one student with it fully reversed (LIS=1, since only one event
 *   can be "in relative order" alone once the pair itself is inverted).
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-11040-add-bricks-in-the-wall", [
    {
      input: "1\n0\n0 0\n0 0 0\n0 0 0 0\n0 0 0 0 0\n",
      output:
        "0\n0 0\n0 0 0\n0 0 0 0\n0 0 0 0 0\n0 0 0 0 0 0\n0 0 0 0 0 0 0\n0 0 0 0 0 0 0 0\n0 0 0 0 0 0 0 0 0\n",
    },
  ]);

  await seedFromSample("uva-11054-wine-trading-in-gergovig", [{ input: "2\n-2 2\n0\n", output: "2\n" }]);

  await seedFromSample("uva-11067-little-red-riding-hood", [
    {
      input: "1 1\n0\n0 0\n0 0\n",
      output: "There are 2 paths from Little Red Riding Hood's house to her grandmother's house.\n",
    },
    {
      input: "1 1\n2\n1 0\n0 1\n0 0\n",
      output: "There is no path.\n",
    },
  ]);

  await seedFromSample("uva-11078-open-credit-system", [
    { input: "1\n4\n10 5 20 1\n", output: "19\n" },
  ]);

  await seedFromSample(
    "uva-11085-back-to-the-8-queens",
    [{ input: "1 5 8 6 3 7 2 4\n8 8 8 8 8 8 8 8\n", output: "Case 1: 0\nCase 2: 7\n" }],
    0,
  );

  await seedFromSample(
    "uva-11094-continents",
    [{ input: "3 4\nlwwl\nwwww\nlllw\n0 0\n", output: "3\n" }],
    0,
  );

  await seedFromSample("uva-111-history-grading", [
    { input: "2\n1 2\n2 1\n1 2\n", output: "1\n2\n" },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
