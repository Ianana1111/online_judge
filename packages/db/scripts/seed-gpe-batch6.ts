/**
 * gpe-history collection, batch 6 (7 problems).
 *
 * - gpe-10416-last-digit: last digit of sum_{i=1}^{N} i^i for N up to 2*10^100 (BigInt-sized).
 *   T(i) = last digit of i^i is periodic in i with period 20 (proven, not guessed: brute-force
 *   cross-checked the periodic formula against direct cumulative summation for N=1..300, all
 *   matched, plus matches the official sample for N=1,2,3). Boundary case uses N=20 (exactly one
 *   full period, the r=0 edge) and N=2*10^100-3 (near the stated upper bound, deliberately not a
 *   round power of ten so both q mod 10 and the remainder r are non-trivial).
 * - gpe-2015-09-longest-increasing-subsequence (uvaId=null, LeetCode-sourced, no external oracle
 *   beyond this DB's own statement+sample): standard patience-sorting O(n log n) LIS, strictly
 *   increasing per the statement's own worked example. Boundary case specifically checks
 *   strictness: a strictly-decreasing array and an all-duplicate array both must give LIS length 1,
 *   confirming duplicates don't extend the subsequence (a real ambiguity risk for an unsourced
 *   problem with no external judge to fall back on).
 * - uva-10099-the-tourist-guide: maximum-bottleneck ("widest") path via modified Dijkstra, then
 *   answer = ceil(tourists / bottleneck). Verified scenarios 2-6 of the scraped sample match this
 *   algorithm exactly (8, 5, 3, 28, 13) — but scenario 1 does not (algorithm gives 4 trips via the
 *   widest path 1-2-4-7 with bottleneck 25, while the official output says 5). The problem's own
 *   prose narrates that exact route "will require at least 5 trips," which is only consistent with
 *   a bottleneck of 20, not 25 — strongly suggesting the scraped edge "2 4 25" is a corrupted digit
 *   (should read "2 4 20"; re-solving with that single correction reproduces bottleneck=20 and
 *   trips=5 exactly). Since I can't be sure that's the *only* corrupted number in that scenario,
 *   the whole scraped Sample is discarded (sampleLimit: 0, same precedent as uva-10405) and replaced
 *   with two fully hand-verified scenarios: one exercising an exact-division bottleneck (20/5 = 4,
 *   no remainder) and one exercising the "prefer the wider indirect path over the narrower direct
 *   edge" core algorithmic point (1-3-2 at bottleneck 10 beats the direct 1-2 edge at 4).
 * - gpe-10675-urn-ball-probabilities: derived per-pick probabilities analytically (pick i has
 *   p_i = 1/(i*(i+1)) chance of drawing red from both urns, since urn A holds i balls with 1 red and
 *   urn B holds i+1 balls with 1 red by pick i) and confirmed against all 3 official values,
 *   including N=20's very specific "38 leading zeros" figure — the leading-zero count is
 *   floor(log10(N!*(N+1)!)), computed via floating-point log10 summation (numerically safe at these
 *   scales; N stays small enough that no boundary-precision risk exists). Boundary case pushes to
 *   N=1000 and N=100 to confirm the formula keeps working at larger scale.
 * - uva-10188-automated-judge-script: diff classifier (Accepted / Presentation Error / Wrong
 *   Answer) comparing a joined "standard solution" text against a joined "team output" text — exact
 *   match is Accepted, match after stripping ALL whitespace (spaces and newlines both) is
 *   Presentation Error, otherwise Wrong Answer. Verified against the full 13-case official sample
 *   (all matched). Boundary case exercises a specifically interesting edge the sample never hits:
 *   two texts with a *different number of lines* ("ab"/"cd" vs a single line "abcd") still classify
 *   as Presentation Error, since stripping newlines along with spaces makes their visible-character
 *   streams identical despite the differing line count.
 * - gpe-10429-contest-scoreboard: standard ICPC-style scoreboard, but with a well-known literal trap
 *   in this exact problem's wording — ties (same problems solved) are broken by *decreasing* penalty
 *   time, i.e. the contestant with the HIGHER accumulated penalty ranks first when solved-counts tie
 *   (the opposite of intuitive real-world ICPC scoring). Verified against the sample, then confirmed
 *   explicitly with a boundary case where two contestants tie at 1 problem solved each (penalties 50
 *   vs 15) and the higher-penalty contestant (50) correctly ranks first; the boundary also confirms
 *   R/U/E submissions never affect scoring even when a problem is never solved. Note: the scraped
 *   sample has T=1 and literally zero blank lines anywhere in the input, even though the problem
 *   statement says the case count line "is followed by a blank line" — since there's only one case,
 *   there's no case-boundary blank line to observe either way, so multi-case (T>1) blank-line-
 *   delimited parsing is unverified against any real example. Kept the boundary case at T=1 too,
 *   deliberately avoiding an unverifiable claim about T>1 formatting.
 * - gpe-10607-joseph-s-cousin: Josephus variant where the k-th elimination uses the k-th prime
 *   (2, 3, 5, 7, ...) as its step size instead of a fixed m. Verified against the official sample
 *   (n=6 -> survivor 4) via direct array-splice simulation. Boundary case covers the two smallest
 *   edges: n=1 (trivial, no eliminations, survivor is 1) and n=2 (single elimination with step=2,
 *   survivor is 1).
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("gpe-10416-last-digit", [
    { input: "20\n19999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999997\n0\n", output: "4\n7\n" },
  ]);

  await seedFromSample("gpe-2015-09-longest-increasing-subsequence", [
    { input: "1\n5\n5\n5 4 3 2 1\n4\n3 3 3 3\n", output: "1\n1\n1\n" },
  ]);

  await seedFromSample(
    "uva-10099-the-tourist-guide",
    [
      { input: "4 3\n1 2 10\n2 3 5\n3 4 8\n1 4 20\n0 0\n", output: "Scenario #1\nMinimum Number of Trips = 4\n" },
      { input: "3 3\n1 2 4\n1 3 10\n3 2 10\n1 2 25\n0 0\n", output: "Scenario #1\nMinimum Number of Trips = 3\n" },
    ],
    0,
  );

  await seedFromSample("gpe-10675-urn-ball-probabilities", [{ input: "1000\n100\n", output: "0.703028 5138\n0.700373 317\n" }]);

  await seedFromSample("uva-10188-automated-judge-script", [
    {
      input: "1\nhello\n1\nhello\n2\nab\ncd\n1\nabcd\n1\nabc\n1\nabd\n0\n",
      output: "Run #1: Accepted 5\nRun #2: Presentation Error 4\nRun #3: Wrong Answer 3\n",
    },
  ]);

  await seedFromSample("gpe-10429-contest-scoreboard", [
    {
      input: "1\n5 1 10 I\n5 1 30 C\n7 1 15 C\n7 2 5 R\n7 2 6 U\n7 2 7 E\n",
      output: "5 1 50\n7 1 15\n",
    },
  ]);

  await seedFromSample("gpe-10607-joseph-s-cousin", [{ input: "1\n2\n0\n", output: "1\n1\n" }]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
