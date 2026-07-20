/**
 * Standalone (no-collection) UVA problems, batch D (7 problems).
 *
 * Every problem here had a from-scratch reference solution run against its full scraped Sample first
 * (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for a
 * boundary case.
 *
 * This batch also surfaced two infrastructure bugs in packages/db/scripts/testcase-seed-helper.ts's
 * shared clean() function (both fixed there, not worked around per-problem):
 *  1. `.replace(/\s+$/, "\n")` only fires when there IS trailing whitespace to match -- a
 *     scraped Sample.output ending in a non-whitespace character (uva-10369's official sample: its
 *     last line has no newline after it at all) was left with no trailing newline in the stored
 *     TestCase.output. Since a real correct submission's stdout almost always ends with one, every
 *     correct submission against that test case would have been marked wrong. Fixed to unconditionally
 *     trim trailing whitespace and re-append exactly one "\n" (except when the result is genuinely
 *     empty, preserving uva-10035's intentional empty-output case).
 *  2. `.replace(/\r\n/g, "\n")` only normalizes CRLF pairs -- uva-10382's official sample has a bare
 *     '\r' with no following '\n' partway through (a dropped-newline scraping artifact gluing two real
 *     lines into one: "9 1\r96 106 16"), which survived into the stored input and would have silently
 *     shifted every token after it for any real submission's parser. Fixed via `\r\n?` (matches a lone
 *     '\r' too, since the '\n?' matches even when there's nothing there to match).
 * Confirmed via a direct DB query that zero of the 149 previously-seeded TestCase rows were affected by
 * either bug (none had a missing trailing newline in stored output except uva-10035's intentional
 * empty case, and none contained any '\r' character at all) -- both fixes are purely forward-looking,
 * not retroactive corrections.
 *
 * - uva-10326-the-polynomial-equation: expand the monic polynomial product of (x-r_i) over all given
 *   integer roots via BigInt coefficient convolution (roots and intermediate coefficients can be large;
 *   the problem's own stated bound is 10^15, well past safe floating-point integer precision).
 *   Reverse-engineered the exact print format from the official sample rather than the ambiguous prose:
 *   the leading (highest-degree) term is always bare "x^n"/"x" (coefficient always 1, monic by
 *   construction, so it never needs a sign), every zero-coefficient middle term is omitted entirely,
 *   a coefficient of exactly +-1 on a non-constant term prints as just "x^i"/"x" (no "1" shown), and
 *   the constant term is the sole exception to both other rules -- it is always shown, even when it's
 *   exactly 0 (printed as "+ 0") or exactly +-1 (printed as "+ 1"/"- 1", the "1" never suppressed).
 *   Verified against the full official sample (14 cases up to degree 50). Boundary case is the
 *   simplest possible nontrivial input, a single root (5): "x - 5 = 0".
 * - uva-10327-flip-sort: minimum adjacent-swap sort count is exactly the number of inversions, counted
 *   via a Fenwick tree over compressed ranks in O(n log n) (n up to 1000 per the statement, though the
 *   official sample pushes to several hundred elements across many cases). Verified against the full
 *   official sample. Boundary case covers both extremes on the same small array: already sorted (0
 *   inversions) and fully reversed (every pair inverted, C(3,2)=3 for a 3-element array) -- both facts
 *   independent of the Fenwick-tree implementation.
 * - uva-10355-superman: parametrize the flight path as P(t)=start+t*(end-start), t in [0,1], and for
 *   each polluted sphere solve the quadratic |P(t)-center|^2=r^2 for the t-interval inside that sphere,
 *   clipped to [0,1] and summed (since the problem guarantees no two regions intersect, a simple sum
 *   is safe -- no double-counting to worry about). Verified against the official sample (2 cities).
 *   Boundary case is a straight segment of length 4 along the x-axis passing directly through the
 *   center of a radius-1 sphere: the chord length inside the sphere is exactly the diameter, 2, so the
 *   covered fraction is 2/4 = 50.00% -- computed by pure geometric reasoning (a line through a sphere's
 *   center always has chord length = diameter), independent of the quadratic-solving code path.
 * - uva-10365-blocks: brute-force search over all (a,b,c) factor triples of N with a<=b<=c (a,b up to
 *   cube-root/square-root bounds respectively), minimizing surface area 2(ab+bc+ca). Verified against
 *   the official sample (many cases up to N=1000). Boundary case is N=1: the only possible box is
 *   1x1x1, surface area 6, independent of the factorization search (there's only one triple to
 *   consider at all).
 * - uva-10369-arctic-network: build the full Euclidean MST via Prim's algorithm over all P outposts,
 *   then -- since S satellite channels let S components merge "for free" without needing a radio link
 *   -- drop the (S-1) largest MST edges and the answer is the largest edge remaining (or 0.00 if
 *   S-1 >= P-1, meaning satellites alone already connect everything). Verified against the full
 *   official sample (5 cases, one with P=500 outposts). Boundary case covers S>=P (every single
 *   outpost already has a satellite channel, so no radio link is ever needed): D=0.00, independent of
 *   the MST computation entirely (there's nothing left to connect by radio).
 * - uva-10382-watering-grass: convert each sprinkler to a horizontal coverage interval (half-length
 *   sqrt(r^2-(w/2)^2), valid only when the sprinkler's radius exceeds half the strip's width -- a
 *   sprinkler that can't even reach across the strip contributes nothing), then solve via the standard
 *   greedy "minimum interval cover" (repeatedly extend coverage using whichever available interval
 *   reaches furthest). Verified against the full official sample (many cases). Boundary case is a
 *   single sprinkler whose radius exactly equals half the strip's width (r=w/2): the covered half-length
 *   is sqrt(0)=0, a single degenerate point with zero horizontal coverage -- impossible to water any
 *   positive-length strip, so the answer must be -1, a fact following directly from the geometry
 *   (a circle tangent to both edges of the strip touches the center line at exactly one point) rather
 *   than from the interval-cover algorithm.
 * - uva-10364-square: the official scraped sample is corrupted -- its header claims N=159 test cases
 *   (matching the 159 lines of official expected output) but only 158 lines of stick data actually
 *   follow the header, meaning one entire test case's input is missing. Since there's no way to
 *   recover the missing line's content, the whole sample is discarded (sampleLimit: 0, same precedent
 *   as uva-10405/uva-10664/uva-10099/gpe-10038 earlier in this project) in favor of fully hand-verified
 *   replacement data: {1,1,1,1} (sum 4, trivially four equal 1-length sides, "yes"), {1,1,1,2} (sum 5,
 *   not divisible by 4, "no" without even needing to search for a partition), and
 *   {2,2,2,2,1,1,1,1} (sum 16, side 4, pairing two 2's per side, "yes") -- each hand-reasoned directly
 *   from the stick lengths rather than trusting the backtracking search's own output.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-10326-the-polynomial-equation", [{ input: "1\n5\n", output: "x - 5 = 0\n" }]);

  await seedFromSample("uva-10327-flip-sort", [
    {
      input: "3\n1 2 3\n3\n3 2 1\n",
      output: "Minimum exchange operations : 0\nMinimum exchange operations : 3\n",
    },
  ]);

  await seedFromSample("uva-10355-superman", [
    { input: "Test\n0 0 0 4 0 0\n1\n2 0 0 1\n", output: "Test\n50.00\n" },
  ]);

  await seedFromSample("uva-10365-blocks", [{ input: "1\n1\n", output: "6\n" }]);

  await seedFromSample("uva-10369-arctic-network", [
    { input: "1\n3 3\n0 0\n100 100\n200 200\n", output: "0.00\n" },
  ]);

  await seedFromSample("uva-10382-watering-grass", [{ input: "1 10 4\n5 2\n", output: "-1\n" }]);

  await seedFromSample(
    "uva-10364-square",
    [
      {
        input: "3\n4 1 1 1 1\n4 1 1 1 2\n8 2 2 2 2 1 1 1 1\n",
        output: "yes\nno\nyes\n",
      },
    ],
    0,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
