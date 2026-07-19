/**
 * gpe-history collection, batch 10 (7 problems).
 *
 * Every problem here had a from-scratch reference solution run against its full scraped Sample first
 * (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for a
 * boundary case.
 *
 * - uva-10591-happy-number: standard happy-number cycle detection (sum of squared digits, repeat,
 *   watch for a return to a previously-seen value as the "unhappy" cycle signal). All 30 official
 *   cases matched. Boundary case checks n=1 (trivially happy, the smallest input) and 999999999 (just
 *   under the stated 10^9 bound).
 * - gpe-10535-prime-distance: count ways to place m identical coins on an n-cell strip such that every
 *   pair of occupied cells has a prime distance, mod 1e9+7. For a fixed occupied-cell set S,
 *   distributing m coins with every cell in S getting >=1 is C(m-1,|S|-1) (stars and bars); answer
 *   sums that over every subset S whose pairwise distances are all prime. Verified via brute-force
 *   subset enumeration against both official cases (n=3,m=2 -> 4; n=6,m=3 -> 24). Boundary case
 *   checks n=1 (only one possible occupied set, {1}, always valid regardless of m -> answer 1) and
 *   m=1 (only singleton subsets are reachable with 1 coin, and singletons are trivially valid since
 *   there's no pair to check -> answer equals n).
 * - gpe-10609-square-root: arbitrary-precision integer square root (Y up to 10^1000, guaranteed to be
 *   a perfect square) via BigInt Newton's method. Matched the one official case exactly. Boundary
 *   case uses two datasets specifically to exercise the "blank line between outputs" formatting rule
 *   the single-case sample can't test, plus a ~61-digit perfect square (X = 10^30+7, squared) to rule
 *   out precision loss at real scale.
 * - gpe-10579-hay-points: sum dictionary values for every word in a job description that exactly
 *   matches a dictionary entry (case/word-exact, no stemming -- "managing" in the sample does NOT
 *   match dictionary entry "manage"). Verified against both official job descriptions (700150 and
 *   150). Boundary case checks a description with zero dictionary-word matches (sum 0) and a
 *   dictionary word appearing multiple times in one description (each occurrence must be summed
 *   separately, not just counted once).
 * - gpe-10766-antimatter-ray-clearcutting: minimum number of lines needed to hit at least m of n
 *   trees, where a line covers every tree collinear with it. Solved via a full "all lines through any
 *   two points" candidate set plus a bitmask-coverage DP over subsets of trees (n<=16 keeps 2^16
 *   states tractable). Verified against both official cases (each needing 2 shots). Found a real
 *   statement/sample mismatch: the statement says to print an empty line between test cases, but the
 *   actual official sample output has none -- trusted the sample. Boundary case covers 3 collinear
 *   trees needing only 1 shot to hit all 3, and a single isolated tree needing exactly 1 shot.
 * - gpe-25081-solving-maze-problems (uvaId=null, no external oracle beyond this DB's own
 *   statement+sample): the problem statement itself guarantees "each input maze has only one solution
 *   path," so a simple DFS-with-backtracking that marks visited cells is sufficient -- no shortest-
 *   path ambiguity is possible by the problem's own guarantee. Verified the DFS reproduces the
 *   official 10x10 sample's exact '+'-marked path (including that both the S and G cells themselves
 *   get overwritten with '+' in the output, not left as S/G). Boundary case covers both a "No
 *   solution" maze (S fully walled in on all four sides) and a trivial S-adjacent-to-G one-step path.
 * - gpe-2015-08-climbing-stairs (uvaId=null, LeetCode-sourced, no external oracle beyond this DB's own
 *   statement+sample): ways(n) is the Fibonacci recurrence ways(1)=1, ways(2)=2,
 *   ways(n)=ways(n-1)+ways(n-2). Matched the one official case (n=4 -> 5). Boundary case checks n=1
 *   (trivial) and n=100 (the stated upper bound) using BigInt; cross-checked ways(100) against the
 *   independently well-known value of Fib(101)=573147844013817084101 rather than trusting the same
 *   code path that produced it.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-10591-happy-number", [{ input: "2\n1\n999999999\n", output: "Case #1: 1 is a Happy number.\nCase #2: 999999999 is an Unhappy number.\n" }]);

  await seedFromSample("gpe-10535-prime-distance", [
    { input: "2\n1 100000\n5 1\n", output: "Case 1: 1\nCase 2: 5\n" },
  ]);

  await seedFromSample("gpe-10609-square-root", [
    {
      input: "2\n1\n1000000000000000000000000000014000000000000000000000000000049\n",
      output: "1\n\n1000000000000000000000000000007\n",
    },
  ]);

  await seedFromSample("gpe-10579-hay-points", [
    { input: "2 2\nfoo 10\nbar 5\nzzz yyy xxx\n.\nfoo foo bar\n.\n", output: "0\n25\n" },
  ]);

  await seedFromSample("gpe-10766-antimatter-ray-clearcutting", [
    { input: "2\n3\n3\n0 0\n1 1\n2 2\n1\n1\n5 5\n", output: "Case #1:\n1\nCase #2:\n1\n" },
  ]);

  await seedFromSample("gpe-25081-solving-maze-problems", [
    {
      input: "S#........\n##........\n..........\n..........\n..........\n..........\n..........\n..........\n..........\n.........G\n",
      output: "No solution\n",
    },
    {
      input: "SG########\n##########\n##########\n##########\n##########\n##########\n##########\n##########\n##########\n##########\n",
      output: "++########\n##########\n##########\n##########\n##########\n##########\n##########\n##########\n##########\n##########\n",
    },
  ]);

  await seedFromSample("gpe-2015-08-climbing-stairs", [{ input: "1\n100\n", output: "1\n573147844013817084101\n" }]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
