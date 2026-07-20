/**
 * Standalone (no-collection) UVA problems, batch H (7 problems).
 *
 * Every problem here had a from-scratch reference solution run against its full scraped Sample first
 * (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for a
 * boundary case.
 *
 * - uva-10633-rare-easy-problem's official sample is corrupted: the ENTIRE expected output is
 *   literally duplicated back-to-back, once with CRLF line endings and once with LF (the second copy
 *   starting immediately after the first with no separator). Verified this isn't a real formatting
 *   quirk by confirming the reference solution's output exactly matches the FIRST copy byte-for-byte,
 *   then discarded the sample entirely (sampleLimit: 0) in favor of fully hand-verified data. The
 *   algorithm itself: N-M (chopping the last digit d off N=10M+d) equals 9M+d algebraically, so for a
 *   given value V, every valid reconstruction is exactly one (M,d) pair with d in [0,9], 9M+d=V, M>=1 --
 *   collect all such N=10M+d, sorted ascending. Boundary case covers V=18 (two solutions: d=0->N=20,
 *   d=9->N=19, both hand-verified by direct chop-and-subtract) and V=100 (exactly one solution,
 *   N=111, since only d=1 satisfies d = 100 mod 9 within [0,9]).
 * - uva-10635-the-art-gallery: since both sequences are permutations of distinct board-square numbers
 *   (no repeats within either sequence), "longest common subsequence between the two paths" reduces to
 *   "longest increasing subsequence" via the standard permutation trick -- map each of Prince's visited
 *   squares to its position in Princess's sequence (dropping squares Princess never visits at all),
 *   then find the LIS of those positions via O(P log P) patience sorting (necessary since P,Q can
 *   reach n*n-1 with n up to 250, i.e. tens of thousands of elements -- a naive O(PQ) LCS DP would be
 *   far too slow for the official sample's actual scale). Verified against the full official sample.
 *   Boundary case is the smallest possible board (n=2, a 2x2 grid with only one possible route from
 *   square 1 to square 4 at all): both Prince and Princess are forced onto the identical single route,
 *   so their longest common route is trivially the whole 2-point path.
 * - uva-108-maximum-sum: classic "maximum sum sub-rectangle" via column-prefix-sums plus a 1D Kadane
 *   scan over every (top,bottom) row-range pair, O(N^3) (trivial for N<=100). Verified against the
 *   official sample, including the problem's own explicitly-worked 4x4 example (sum 15 from the
 *   lower-left corner). Boundary case is the sharpest edge of Kadane's algorithm: a 1x1 grid containing
 *   a single negative number, forcing the answer to be that negative value itself (since a sub-rectangle
 *   must contain at least one cell -- an empty selection isn't a valid choice, unlike some maximum-
 *   subarray variants that allow an all-negative array to trivially answer 0).
 * - uva-10800-not-that-kind-of-graph: reverse-engineered the exact rendering rule by brute-force
 *   searching combinations of (row assignment for R/F, column offset, height range) against the
 *   official sample's actual character grid (not guessed from the prose, which doesn't fully specify
 *   the geometry): every glyph sits at the row of the LOWER of its two endpoint levels (the rising
 *   segment's *source* level, or the falling segment's *destination* level -- both are "where the line
 *   touches bottom"), placed at column (segment index + 1) so column 0 is always blank, and the height
 *   range spans every level INCLUDING the very first (pre-any-move) level -- but any row that level
 *   range implies which no glyph ever actually touches is omitted from the output entirely, not just
 *   trimmed (confirmed by the official sample's single-'F' case, whose 2-level range [0,-1] only ever
 *   draws in the -1 row, so the 0 row is dropped rather than printed blank). Verified against the full
 *   20-case official sample once the rule was found. Boundary case is the smallest possible input, a
 *   lone 'R': only 1 row is drawn (the destination level's row; the source level's row, which no glyph
 *   touches, is omitted per the rule above).
 * - uva-10810-ultra-quicksort: adjacent-swap sort count is exactly the number of inversions, counted
 *   via a Fenwick tree over compressed ranks (n can reach ~500,000, so an O(n log n) approach is
 *   required, matching what the official sample's actual scale needs). Verified against the full
 *   official sample. Boundary case covers both trivial zero-inversion inputs: an already-sorted
 *   3-element array and a single-element array, neither needing any swaps by definition.
 * - uva-10813-traditional-bingo: found a real parsing trap not obvious from the prose -- each game's
 *   announcement list is always a full permutation of all 75 BINGO numbers (never truncated to just
 *   however many are needed to win), so after determining the win point the parser must still consume
 *   exactly 75 tokens before moving on to the next game's card, or every subsequent game's data gets
 *   silently misaligned by however many announcement-list tokens were left unconsumed. Verified against
 *   the full official sample (20 games) only after catching and fixing this exact bug (initially only
 *   19 of 20 cases matched, with every case after the first showing a wildly wrong announced-count,
 *   the signature of a token-stream misalignment). Boundary case constructs a card whose B-column
 *   (row 1) is exactly {1,16,31,46,61}, then announces precisely those 5 numbers in order: row 1
 *   completes on the 5th call, hand-confirmed that no other row/column/diagonal could possibly
 *   complete with only those 5 (of 75) numbers announced, before trusting the win-detection code.
 * - uva-10815-andy-s-first-dictionary: extract maximal letter-only runs (any non-letter, including
 *   digits, punctuation, and whitespace, is a word boundary), lowercase and deduplicate via a Set, sort
 *   alphabetically. Verified against the full official sample (a large real text). Boundary case
 *   covers both the case-insensitive-dedup requirement ("Apple" and "apple" on separate lines must
 *   collapse to one "apple" entry) and a hyphenated word ("Sun-day" splitting into two separate words
 *   "sun" and "day", since '-' is not a letter).
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-10633-rare-easy-problem", [{ input: "18\n100\n0\n", output: "19 20\n111\n" }], 0);

  await seedFromSample("uva-10635-the-art-gallery", [
    { input: "1\n2 1 1\n1 4\n1 4\n", output: "Case 1: 2\n" },
  ]);

  await seedFromSample("uva-108-maximum-sum", [{ input: "1\n-5\n0\n", output: "-5\n" }]);

  await seedFromSample("uva-10800-not-that-kind-of-graph", [
    { input: "1\nR\n", output: "Case #1:\n| /\n+---\n\n" },
  ]);

  await seedFromSample("uva-10810-ultra-quicksort", [
    { input: "3\n1\n2\n3\n1\n5\n0\n", output: "0\n0\n" },
  ]);

  await seedFromSample("uva-10813-traditional-bingo", [
    {
      input:
        "1\n" +
        "1 16 31 46 61\n" +
        "2 17 32 47 62\n" +
        "3 18 48 63\n" +
        "4 19 34 49 64\n" +
        "5 20 35 50 65\n" +
        "1 16 31 46 61 2 17 32 47 62 3 18 33 48 63 4 19 34 49 64 5 20 35 50 65 6 7 8 9 10 11 12 13 14 15 21 22 23 24 25 26 27 28 29 30 36 37 38 39 40 41 42 43 44 45 51 52 53 54 55 56 57 58 59 60 66 67 68 69 70 71 72 73 74 75\n",
      output: "BINGO after 5 numbers announced\n",
    },
  ]);

  await seedFromSample("uva-10815-andy-s-first-dictionary", [
    { input: "Apple apple\nSun-day\n", output: "apple\nday\nsun\n" },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
