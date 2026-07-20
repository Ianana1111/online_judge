/**
 * gpe-history collection, batch 14 (7 problems) -- the last batch of "normal" gpe-history problems.
 *
 * Every problem here had a from-scratch reference solution run against its full scraped Sample first
 * (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for a
 * boundary case. No corrupted samples or special-judge problems found in this batch.
 *
 * - gpe-22151-big-mod (uva-374): textbook BigInt fast modular exponentiation (B^P mod M), with the
 *   degenerate M=1 case handled explicitly (result always 0, since every integer is 0 mod 1). Verified
 *   against both official cases. Boundary case exercises exactly that M=1 degenerate branch (2^10 mod
 *   1 = 0), a fact true by definition independent of the exponentiation algorithm.
 * - gpe-10645-euclid-problem (uva-10104): standard recursive extended Euclidean algorithm. Verified
 *   against both official cases by hand-tracing the recursion step by step (not just running the code)
 *   -- confirmed the well-known property that this exact recursive formulation always naturally
 *   produces the minimal |X|+|Y| solution with the required X<=Y tie-break, with no extra adjustment
 *   logic needed. Boundary case is the smallest nontrivial input, A=B=1 (gcd 1, forced solution X=0,Y=1
 *   since 0*1+1*1=1 and it's the unique minimal pair once X=1,Y=0 is rejected by the X<=Y tie-break).
 * - gpe-10531-zipf-s-law (uva-10126): word-frequency counting (words = maximal letter runs,
 *   case-insensitive) per test case, each case's text spanning every line up to its own "EndOfText"
 *   marker (a single test case can itself span multiple lines/paragraphs, as the official sample's one
 *   test case does, combining two separate quoted passages into one shared word count). Verified
 *   against the official sample. Boundary case is a short single-line text ("the cat sat on the mat")
 *   with n=1: hand-counted word frequencies (the=2, cat/sat/on/mat=1 each) confirm exactly 4 words
 *   occur once, alphabetically cat, mat, on, sat -- independent of the frequency-counting code.
 * - gpe-10471-counting-chaos (uva-11309): brute-force minute-by-minute search for the next palindromic
 *   clock reading, where the digit string to test is built by stripping HH's leading zeros always
 *   (never stripping MM's leading zero unless HH is exactly 0, in which case HH contributes nothing at
 *   all to the combined string and MM's own leading zero is also stripped) -- this precise reading of
 *   the statement's stripping rule was confirmed by testing it is the *only* interpretation consistent
 *   with the official sample's very first case (00:00 -> 00:01, which only works if HH=0 contributes an
 *   empty string, since a lone "1" is trivially a palindrome but "01" is not). Verified against all 3
 *   official cases under that confirmed interpretation. Boundary case covers the day-wraparound edge:
 *   23:59 rolls over to 00:00, which is immediately palindromic (HH=0 contributes nothing, MM=0 stripped
 *   is just "0", trivially a single-character palindrome).
 * - gpe-10642-marbles: distinguishable-marbles-into-boxes-with-a-minimum-per-box counting via an
 *   O(N^2*K) DP (tractable at the official sample's actual scale, N up to 900) that convolves one box
 *   at a time using binomial coefficients (mod 10^9+7) to pick which marbles go into each newly-added
 *   box. Verified against the full official sample, including case 2's N<K*X infeasibility (0 ways) and
 *   case 3's large N=900,K=5,X=20 case matching the official 76094425 exactly. Boundary case
 *   independently reasons about two forced-unique scenarios that don't need the DP's correctness to be
 *   trusted: N=K=3,X=1 (every box needs >=1 of exactly 3 marbles into exactly 3 boxes forces a bijection,
 *   so the count is simply 3!=6) and N=5,K=1,X=5 (a single box takes all 5 marbles -- there is only ever
 *   1 way to do that, since the box's identity is fixed and marble order within a box doesn't matter).
 * - gpe-10422-is-this-integration (uva-10209): area of a square split by four quarter-circle arcs
 *   (radius = side length, centered at each corner) into regions by "how many of the 4 quarter-disks
 *   cover this point" -- computed via exact per-row circle/segment interval arithmetic (for each y,
 *   every circle's x-coverage interval is exact via the circle equation) combined with fine-step
 *   Simpson's-rule integration over y (4000 steps; each row's coverage-count partition is computed
 *   exactly, only the integration over rows is numerical, giving far more precision than the 3 decimal
 *   digits required). This empirically determined -- and confirmed against all 3 official samples --
 *   that coverage counts 0 and 1 never actually occur anywhere in the square, and that the officially
 *   expected 3-number output is exactly (coverage-4 area, coverage-3 area, coverage-2 area) in that
 *   order. As a second, fully independent cross-check (not just trusting the Simpson integration path),
 *   the a=1 boundary case's areas were also computed via a 20-million-sample Monte Carlo simulation,
 *   which agreed with the Simpson result to within Monte Carlo's own expected statistical noise at that
 *   sample size. Boundary case covers a=0 (degenerate zero-area square, trivially 0.000 0.000 0.000)
 *   and a=1 (a substantial, non-degenerate unit square, cross-validated by the independent Monte Carlo
 *   check above).
 * - gpe-11130-the-priest-mathematician (uva-10254): Frame-Stewart 4-peg Tower of Hanoi recurrence,
 *   T(n) = min over 1<=k<n of (2*T(k) + 2^(n-k) - 1), computed via BigInt DP (values grow large enough,
 *   even for modest n, to need arbitrary precision). Verified against all 4 official sample values,
 *   including the problem's own narrated N=64 -> 18433 anecdote. Boundary case covers N=0 (trivially 0
 *   moves, no discs to move) and N=3 (5 moves), a well-known independently-checkable Frame-Stewart
 *   reference value confirmed by hand-tracing both candidate splits (k=1 gives 2*1+3=5, k=2 gives
 *   2*3+1=7, so the minimum is 5) rather than just trusting the DP's own output.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("gpe-22151-big-mod", [{ input: "2\n10\n1\n", output: "0\n" }]);

  await seedFromSample("gpe-10645-euclid-problem", [{ input: "1 1\n", output: "0 1 1\n" }]);

  await seedFromSample("gpe-10531-zipf-s-law", [
    { input: "1\nthe cat sat on the mat\nEndOfText\n", output: "cat\nmat\non\nsat\n" },
  ]);

  await seedFromSample("gpe-10471-counting-chaos", [{ input: "1\n23:59\n", output: "00:00\n" }]);

  await seedFromSample("gpe-10642-marbles", [
    { input: "2\n3 3 1\n5 1 5\n", output: "Case 1: 6\nCase 2: 1\n" },
  ]);

  await seedFromSample("gpe-10422-is-this-integration", [
    { input: "0\n1\n", output: "0.000 0.000 0.000\n0.315 0.511 0.174\n" },
  ]);

  await seedFromSample("gpe-11130-the-priest-mathematician", [
    { input: "0\n3\n", output: "0\n5\n" },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
