/**
 * gpe-history collection, batch 7 (6 problems; 7th candidate excluded, see below).
 *
 * - gpe-10906-matrix-decompressing (uva-11082) was pulled from this batch entirely and left with 0
 *   TestCase rows. It's explicitly a special-judge problem: "In case of multiple solutions, you can
 *   output any one of them" — and the official scraped Sample itself proves this isn't theoretical:
 *   it gives the *same* input twice as two separate cases and prints two *different* valid matrices.
 *   Seeding exact-diff TestCase data for it would fail every submission that finds an equally valid
 *   but different-looking matrix, same reasoning as gpe-10658-is-bigger-smarter.
 * - gpe-10603-cutting-sticks: classic interval DP (matrix-chain-style), dp[i][j] = min over splits of
 *   dp[i][k]+dp[k][j]+(points[j]-points[i]) over the cut points plus the stick's two ends. Matched
 *   both official cases exactly. Boundary case adds the trivial n=1 cut (cost is just the stick
 *   length, independent of cut position) alongside a small multi-cut case.
 * - uva-993-product-of-digits: greedy digit factorization (divide out 9,8,...,2 in that order,
 *   ascending-sort the resulting digits) reproduced all 14 non-trivial cases in the official sample
 *   exactly, including N=0 -> "0" and primes-too-large -> "-1". Boundary case uses N=536870912=2^29
 *   (the largest power of two under the stated 10^9 bound) to exercise a factorization requiring nine
 *   repeated 8s plus a leftover 4, alongside the two smallest single-digit primes (2, 7).
 * - gpe-10601-eternal-truths: BFS over (row, col, phase) states where phase cycles through move
 *   lengths [1,2,3] and a move can only end early if it hits 'E' mid-stride (never on hitting a wall,
 *   which invalidates that whole direction attempt). Reproduced both official cases exactly,
 *   including the "hit E mid-stride on move 3" case, which was hand-traced by simulating along the
 *   grid before trusting the code. Boundary case adds two straight-corridor cases: one where E sits
 *   at cumulative distance 7, only reachable by wrapping the 1-2-3 cycle back to a 4th move of length
 *   1 (answer 4), and one where E sits at cumulative distance 3, reached exactly at the *end* of move
 *   2 rather than mid-stride (answer 2) — neither pattern is exercised by the official sample.
 * - gpe-10038-disk-tree (uva-1556): trie + lexicographic DFS printing with depth-based space
 *   indentation. The scraped official Sample turned out to be corrupted: every line had its leading
 *   indentation stripped entirely, and the blank-line separators between top-level directory groups
 *   were duplicated in one place and dropped in two others (3 blank lines present vs. the 4 a
 *   consistent "one blank line after each top-level group" rule requires). Confirmed the corruption
 *   is whitespace-only, not structural, by stripping leading spaces from my own algorithm's output
 *   and diffing against the sample's content-only line sequence — they matched exactly, name-for-name
 *   and in the same order. Used sampleLimit: 0 and reconstructed the correct indentation/blank-line
 *   placement from the statement's explicit rules (depth-based space count, blank line after each
 *   dataset) applied consistently per top-level group, matching this exact classic example's
 *   well-known canonical formatting. Added a second, smaller single-chain dataset to the same
 *   boundary case as an independent sanity check of the recursion/indentation at a small scale.
 * - gpe-10520-conformity: group frosh by their sorted 5-course combination, find the max group size,
 *   sum every group's size that ties for that max. Matched both official cases exactly. Boundary case
 *   specifically distinguishes "most popular total" from "everyone in a tied-for-something group":
 *   one combination repeated twice plus three other combinations each appearing once — the correct
 *   answer counts only the 2-person combination (2), not all 5 students.
 * - gpe-2009-24-unique-lines (uvaId=null, no external oracle beyond this DB's own statement+sample):
 *   canonical line representation via reduced, sign-normalized (A,B,C) coefficients of Ax+By=C for
 *   every point pair, counted via a Set. Matched both official cases exactly, including the second
 *   case's two separate 3-point-collinear lines through the origin (y=x and y=-x) plus four more
 *   single-pair lines. Boundary case checks the n=2 trivial pair (always exactly 1 line) and 4
 *   fully collinear points (still exactly 1 line despite 6 pairs), confirming the reduction doesn't
 *   accidentally treat different points on the same line as distinct lines.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("gpe-10603-cutting-sticks", [
    { input: "50\n1\n30\n20\n4\n1 2 3 18\n0\n", output: "The minimum cutting is 50.\nThe minimum cutting is 42.\n" },
  ]);

  await seedFromSample("uva-993-product-of-digits", [{ input: "3\n2\n7\n536870912\n", output: "2\n7\n4888888888\n" }]);

  await seedFromSample("gpe-10601-eternal-truths", [
    { input: "2\n1 8\nS......E\n1 4\nS..E\n", output: "4\n2\n" },
  ]);

  await seedFromSample(
    "gpe-10038-disk-tree",
    [
      {
        input:
          "7\nWINNT\\SYSTEM32\\CONFIG\nGAMES\nWINNT\\DRIVERS\nHOME\nWIN\\SOFT\nGAMES\\DRIVERS\nWINNT\\SYSTEM32\\CERTSRV\\CERTCO~1\\X86\n\n1\nA\\B\\C\n\n",
        output:
          "GAMES\n DRIVERS\n\nHOME\n\nWIN\n SOFT\n\nWINNT\n DRIVERS\n SYSTEM32\n  CERTSRV\n   CERTCO~1\n    X86\n  CONFIG\n\nA\n B\n  C\n\n",
      },
    ],
    0,
  );

  await seedFromSample("gpe-10520-conformity", [
    {
      input:
        "5\n100 101 102 103 104\n100 101 102 103 104\n200 201 202 203 204\n300 301 302 303 304\n400 401 402 403 404\n0\n",
      output: "2\n",
    },
  ]);

  await seedFromSample("gpe-2009-24-unique-lines", [
    { input: "2\n2 0 0 5 5\n4 0 0 1 1 2 2 3 3\n", output: "1\n1\n" },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
