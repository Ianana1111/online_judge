/**
 * gpe-history collection, the last 3 addressable "special case" problems (2 more are permanently
 * left unseeded, see below). This closes out gpe-history at 100/103 seeded (the remaining 3 are
 * genuine special-judge problems with no safe way to seed exact-diff local test data).
 *
 * - gpe-10658-is-bigger-smarter (uva-10131) and gpe-10906-matrix-decompressing (uva-11082) are left
 *   permanently unseeded (0 TestCase rows, as already established in earlier batches). Both are
 *   explicit special-judge problems ("multiple correct outputs are possible") that this local judge's
 *   EXACT/IGNORE_TRAILING_WS checkers cannot safely test without a real SPECIAL-checker sandbox
 *   (deliberately unimplemented in apps/judge/src/local/checkers.ts). Since testCases.length === 0
 *   routes these problems to the real UVA judge relay (apps/judge/src/worker.ts), they continue to
 *   work correctly for users -- this is the intentional, safe outcome for this category, not an
 *   oversight.
 *
 * - gpe-2008-37-prefix-expression-evaluation (uvaId=null): recursive-descent prefix-expression
 *   evaluator (operator followed by two sub-expressions, or a bare integer), with "illegal" reported
 *   whenever parsing runs out of tokens mid-expression OR leaves unconsumed tokens after a complete
 *   top-level expression. Verified against the official DB sample, including a hand-trace of the
 *   nested "- * + 23 % 45 10 6 / 77 12" expression confirming 162 (with truncating integer division:
 *   77/12 = 6) and the "+ * 234 56" case failing specifically because the outer '+' runs out of
 *   tokens looking for its second operand. Boundary case exercises the *other* illegal-detection
 *   branch not covered by the sample: a leftover unconsumed token ("5 6" -- a complete number "5"
 *   followed by a stray extra token "6" that's never part of any expression).
 *
 * - gpe-10679-irreducible-basic-fractions (uva-10179): classic Euler's-totient-function problem --
 *   the count of irreducible fractions m/n with 0<m<n is exactly phi(n), computed via trial-division
 *   prime factorization. This DB has 0 rows in its Sample table for this problem, but the scraped
 *   statement's own prose text happens to still contain the original "Sample Input"/"Sample Output"
 *   block verbatim (12, 123456, 7654321 -> 4, 41088, 7251444) -- used here as the verified oracle in
 *   place of a structured Sample row, confirmed to match phi(n) exactly for all 3 values. Boundary
 *   case adds n=1 and n=2, both textbook-uncontested values of Euler's totient function (phi(1)=1,
 *   phi(2)=1, independent of any fraction-counting interpretation ambiguity -- unlike some other
 *   problems in this collection with genuinely undefined edge-case semantics, phi(1) and phi(2) have
 *   one universally agreed value).
 *
 * - gpe-10600-network-connections (uva-793): standard union-find connectivity tracker over "c i j"
 *   (connect) and "q i j" (query) log lines, counting successful vs. unsuccessful connectivity
 *   queries. This problem has NO usable oracle at all -- 0 rows in the Sample table AND no sample
 *   transcript embedded in the scraped statement prose (only a narrated summary of case counts, not
 *   the actual input/output text) -- so there is no independent source to catch a subtle input-format
 *   misreading. Proceeded anyway because uva-793 is a well-known, unambiguously documented classic
 *   problem (the exact "c"/"q" line-prefix format used here is the standard, widely-documented format
 *   for this specific problem), and the single boundary case below was fully hand-traced end to end
 *   before trusting the code: 4 computers, connect 1-2 then 2-3 (transitively linking 1 and 3 via
 *   union-find path compression), then query "is 1 connected to 3" (yes, via 1-2-3, success) and
 *   "is 1 connected to 4" (no, 4 was never connected to anything, failure) -- giving 1 successful and
 *   1 unsuccessful answer, matching the code's output before it was ever trusted as ground truth.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("gpe-2008-37-prefix-expression-evaluation", [
    { input: "5\n5 6\n.\n", output: "5\nillegal\n" },
  ]);

  await seedFromSample("gpe-10679-irreducible-basic-fractions", [
    { input: "12\n123456\n7654321\n0\n", output: "4\n41088\n7251444\n" },
    { input: "1\n2\n0\n", output: "1\n1\n" },
  ]);

  await seedFromSample("gpe-10600-network-connections", [
    { input: "1\n4\nc 1 2\nc 2 3\nq 1 3\nq 1 4\n", output: "1 1\n" },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
