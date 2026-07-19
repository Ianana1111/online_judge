/**
 * gpe-history collection, batch 4 (7 problems).
 *
 * - uva-151-power-crisis: Josephus-style elimination search for the smallest step m that makes
 *   region 13 the last one turned off. Sanity-checked the elimination simulator against the
 *   problem statement's OWN worked example (N=17, m=5 -> elimination order
 *   1,6,11,16,5,12,2,9,17,10,4,15,14,3,8,13,7) before trusting it to brute-force search for m, then
 *   confirmed the search reproduces the official sample (N=17 -> m=7). Boundary case adds N=13 (the
 *   smallest allowed N, where region 13 IS the very last index so m=1 trivially works) and N=99
 *   (the largest allowed N, just under the stated <100 bound).
 * - gpe-22261-sorting-the-alphanumeric-list-in-comma-separated-value-forma (uvaId=null, no external
 *   oracle beyond this DB's own statement+sample): sorts CSV lines by per-field comparison of
 *   *trimmed* field values while preserving and printing the *untrimmed* original line. When one
 *   line's fields are a strict prefix of another's (same fields, fewer of them), the shorter one
 *   sorts first — confirmed this isn't an ambiguous "tie" (which the statement allows any order
 *   for) by checking the official sample: two lines share identical first three trimmed fields but
 *   differ only in a 4th field one of them lacks, and the shorter one is placed first, matching
 *   standard tuple/array lexicographic ordering. Boundary case deliberately avoids constructing any
 *   genuine tie (which would make "the" correct output ambiguous) and re-exercises the same
 *   prefix-ordering rule with fresh field values.
 * - gpe-11058-exact-sum: 2-sum problem, minimize |price_i - price_j| among all pairs summing to M.
 *   Trap: the official sample's expected output has NO blank line between test cases even though
 *   the problem statement explicitly says to print one after each — trusted the actual sample over
 *   the prose. Boundary case has two parts: a triple of equal values where the minimal-diff pair is
 *   trivially 0, and a case where the closest-summing pair is NOT the two most extreme-valued array
 *   elements (guards against an implementation that only checks the array's overall min/max instead
 *   of searching all valid pairs).
 * - gpe-23661-bit-mask: maximize N|M over M in [L,U], ties broken by smallest M. Boundary case
 *   checks N=0 (answer is just M=U, the OR is literally M itself so it's monotonic) and a
 *   degenerate L==U range (forced single choice, no search needed).
 * - gpe-11179-wavio-sequence: classic wavio = max over i of 2*min(LIS ending at i, LDS starting at
 *   i)-1. Boundary case checks the N=1 trivial case and an all-equal-value array, which must yield
 *   1 (duplicate values can't extend either the strictly-increasing or strictly-decreasing run).
 * - uva-10664-luggage: subset-sum "can we split into two equal-weight groups" (parity check + 0/1
 *   knapsack). The official scraped Sample is corrupted: its *output* is literally the correct
 *   40-line answer duplicated into 80 lines (confirmed by computing all 40 answers independently —
 *   they exactly match the sample output's first 40 lines, which then repeat verbatim as lines
 *   41-80). Used sampleLimit:0 to discard the untrustworthy scraped Sample outright and instead
 *   promoted its (verified-correct, large and varied) 40-test-case *input* into a boundary case
 *   paired with the independently-computed, deduplicated 40-line output — preserving the value of
 *   that rich official test data while fixing the duplication corruption. A second, small boundary
 *   case adds an explicit minimal example.
 * - gpe-2008-06-parser-and-evaluator (uvaId=null, no external oracle): recursive-descent expression
 *   parser/evaluator with a genuinely unusual, non-C-like precedence: unary minus binds tightest,
 *   then '%' binds *tighter than* '*' and '/' (not the same precedence, unlike C/C++/Java), then
 *   '*'/'/' , then binary '+'/'-' loosest — confirmed against the official sample's third case
 *   (-9*80+72/61%7 = -706) which only works out if '%' groups before '/': 72/(61%7) = 72/5 = 14,
 *   -720+14 = -706; the "same precedence, left-to-right" reading gives -719 instead, which is wrong.
 *   Division/modulo truncate toward zero (C semantics, confirmed via JS BigInt's native
 *   truncating-toward-zero behavior for both operators). The grammar as literally written looks
 *   right-recursive for '+'/'-' (E -> T + E | T - E | T) but the official sample's second case
 *   (789-400+300 = 689) only matches standard *left*-associative evaluation, not right-associative
 *   ((789-400)+300=689 vs 789-(400+300)=89) — trusted the sample's actual arithmetic over the
 *   grammar's literal recursive-descent shape. Boundary case exercises: unary-minus-of-parenthesized
 *   expression combined with a chained '%' sequence and explicit '*' binding order
 *   (-(3+4)*20%7%3 = 0), and truncating-toward-zero negative division (-7/2 = -3, not -4).
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-151-power-crisis", [{ input: "13\n99\n0\n", output: "1\n15\n" }]);

  await seedFromSample("gpe-22261-sorting-the-alphanumeric-list-in-comma-separated-value-forma", [
    {
      input: "1\n  zebra , 1\napple, 2\napple, 2, extra\n",
      output: "apple, 2\napple, 2, extra\n  zebra , 1\n",
    },
  ]);

  await seedFromSample("gpe-11058-exact-sum", [
    {
      input: "4\n5 5 5 10\n10\n4\n1 50 51 100\n101\n",
      output:
        "Peter should buy books whose prices are 5 and 5.\nPeter should buy books whose prices are 50 and 51.\n",
    },
  ]);

  await seedFromSample("gpe-23661-bit-mask", [{ input: "0 5 20\n7 7 7\n", output: "20\n7\n" }]);

  await seedFromSample("gpe-11179-wavio-sequence", [{ input: "1\n42\n5\n1 1 1 1 1\n", output: "1\n1\n" }]);

  await seedFromSample(
    "uva-10664-luggage",
    [
      {
        input:
          "40\n1 2 1 2 1\n2 3 4 1 2 5 10 50 3 50\n3 5 2 7 1 7 5 2 8 9 1 25 15 8 3 1 38 45 8 1\n1 2 3 4 5 6 7 8 9 10\n2 3 4 5 6 7 8 9 10\n99\n8 6 8 10 10 10 9 9 5 1 1 4 7 5 10 7\n5 7 9 10 4 6 1 4\n7 1 8 6 8 7 6 8 7 6 8 1 7 10 5 5 4 4 1\n7 5 1 9 1 8 9 4 8 1 1 10\n8 6 3 7 4 9 4 5\n135 135\n1 1 1 1 1 1 1 1\n1 50 50 100 199 200\n3 57 89 10 31 4 1 4 1\n44 22 58 31 7 37 1\n99 32 8 49 9 2 1\n35 40 23 1 1\n66 55 13 5 47 11 2 1\n50 53 36 56 3 1\n10 19 2 8\n14 9 2 18 16 12\n10 12 16 4 19 20\n10 17 18\n2 4 5 8 1\n5 17 20 4 18 19 19 4 7 12\n14\n8 3 19 15 19 9\n3 19 10 20\n3 16 10 2 8\n6\n2 9 2 20\n5 6 11 17 20 6 4\n16 18 4 4\n6 14 12\n1 1 1 2 2 2 2 3 3 3 4 4 5 6 6 6 7\n1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20\n1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 111\n3 3 3 3 36 3 3 3 3 3 3 3\n200 200 200 200 200 200 200 200 200 200\n",
        output:
          "NO\nYES\nYES\nNO\nYES\nNO\nYES\nYES\nNO\nYES\nYES\nYES\nYES\nYES\nYES\nNO\nYES\nNO\nNO\nNO\nNO\nNO\nNO\nNO\nYES\nNO\nNO\nNO\nNO\nNO\nNO\nNO\nNO\nNO\nNO\nYES\nYES\nNO\nNO\nYES\n",
      },
      { input: "2\n3 3\n1 2 3\n", output: "YES\nYES\n" },
    ],
    0,
  );

  await seedFromSample("gpe-2008-06-parser-and-evaluator", [
    { input: "-(3+4)*20%7%3\n-7/2\n", output: "case 1:\n0\n\ncase 2:\n-3\n\n" },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
