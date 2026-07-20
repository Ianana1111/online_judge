/**
 * Standalone (no-collection) UVA problems, batch B (7 problems).
 *
 * Every problem here had a from-scratch reference solution run against its full scraped Sample first
 * (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for a
 * boundary case.
 *
 * - uva-10079-pizza-cutting: the classic "maximum regions from N straight lines through a circle"
 *   formula, pieces(n) = (n^2+n+2)/2, computed via BigInt since n can be up to 2.1*10^8 (n^2 alone
 *   exceeds JS's safe-integer range). Verified against the full official sample (many lines,
 *   terminated by a negative sentinel). Boundary case covers n=1 (a single straight cut always makes
 *   exactly 2 pieces, a fact obvious from the problem definition itself) and n=2 (4 pieces, two
 *   crossing cuts).
 * - uva-10082-wertyu: shift-one-key-left QWERTY decoder. Verified against the full official sample
 *   (a ~2300-character multi-line message) -- this caught a real bug in the reference implementation
 *   itself: the physical keyboard's second row is "QWERTYUIOP[]\" (with a trailing backslash key),
 *   and omitting that backslash from the row string left the decoder unable to map '\' at all,
 *   silently passing it through unchanged instead of decoding it to ']' -- caught only by diffing
 *   against the real sample, not by inspection. Boundary case exercises the digit row specifically
 *   (a row the huge-but-all-letters-and-punctuation official sample never actually uses): "2345"
 *   decodes to "1234".
 * - uva-10106-product: BigInt multiplication of two numbers up to 250 digits each, read as pairs of
 *   lines. Verified against the full official sample (10 pairs, including a 90-digit x a 78-digit
 *   number). Boundary case is the sharpest edge of BigInt multiplication, zero times a nonzero number,
 *   which must print "0" and not "-0" or any other degenerate form.
 * - uva-10107-what-is-the-median: this is a *running* median problem, not just "the median of the
 *   final list" -- each newly read integer is inserted into a sorted list and the *current* median is
 *   printed immediately after every single insertion (confirmed by hand-tracing the problem's own
 *   worked example against the official sample: after reading 1,3,6,2,7,8, the medians printed after
 *   each step are exactly 1,2,3,3,4,4.5-truncated-to-4 -- and the official sample independently
 *   confirms this exact incremental-print behavior, including a non-trivial floor-division median of
 *   27 partway through). Verified against the full official sample. Boundary case is the trivial
 *   single-value input (median of one number is that number itself, independent of any median-of-two
 *   averaging logic).
 * - uva-10130-supersale: the statement's "shared pool" wording is misleading -- it initially reads
 *   like a Multiple Knapsack Problem (items shared/depleted across people), but that reading was
 *   *tested* against the real official sample and does NOT reproduce it (confirmed by explicitly
 *   coding the MKP interpretation and running it against the sample, watching it fail). The correct
 *   reading, confirmed to match the sample exactly, is that "one object of each kind" is a per-person
 *   restriction only (a supermarket restocks each item type, so different family members can each buy
 *   their own TV) -- i.e. every person solves their own INDEPENDENT 0/1 knapsack over the same full,
 *   unconsumed catalog, and the answer is simply the sum of each person's optimal knapsack value. This
 *   also sidesteps a genuinely hard piece of theory: while investigating the (incorrect) shared-pool
 *   reading, an empirical 300-trial randomized test proved that the "obvious" sequential item-scan
 *   multi-knapsack DP is NOT actually a valid algorithm for true Multiple Knapsack (it produced
 *   suboptimal answers on ~2% of small random instances vs. an exhaustive brute force) -- moot once the
 *   correct, much simpler independent-knapsack-per-person reading was confirmed, but worth noting here
 *   since it's exactly the kind of subtle trap this verification methodology exists to catch. Verified
 *   against the full official sample (11 test cases). Boundary case is the trivial single item/single
 *   person case where the item's weight exactly equals the person's capacity (value = that item's
 *   price, with no combinatorial choice at all).
 * - uva-10142-australian-voting: instant-runoff voting simulation -- tally first (non-eliminated)
 *   preferences each round; if any candidate exceeds 50% of the total ballot count, they win;
 *   otherwise eliminate *every* candidate tied for the current-round minimum vote count and recount;
 *   if that elimination would remove every remaining candidate simultaneously (a full tie with no
 *   candidate to declare a winner over), report all of them as tied. Verified against the full
 *   official sample (multiple rounds of elimination). Boundary case covers both terminal conditions on
 *   a minimal 2-candidate election that the sample doesn't isolate as cleanly: an immediate majority
 *   (2 of 3 ballots rank Alice first, an outright >50% win with zero eliminations) and a complete
 *   1-vote-each tie between the only two candidates (both immediately "tied for the lowest count,"
 *   which is also everyone remaining, terminating instantly with both names reported).
 * - uva-10150-doublets was seeded with sampleLimit:0, discarding the official Sample entirely, and
 *   given only ONE hand-authored boundary case covering exclusively the "No solution." branch. This
 *   problem is an explicit special-judge problem: "If there are several minimal solutions, any one
 *   will do" -- and the real official sample itself proves this isn't theoretical, showing several
 *   genuine multi-step doublet chains (e.g. "kmyiuno" -> "kmyiuao" -> "kryiuao" -> ... -> "naztlex")
 *   that are almost certainly not the *only* shortest path between those word pairs. Seeding the
 *   official sample's specific chains as exact-diff TestCase data would fail any correct submission
 *   that finds a different, equally-short valid doublet chain (same reasoning as gpe-10658 and
 *   gpe-10906 earlier in this session). The "No solution." case has no such ambiguity (it's a single,
 *   uniquely-determined string with no alternative correct output), so it's safe to seed on its own:
 *   a 2-word dictionary ("abcd", "wxyz") with no possible connecting chain between them (differ in
 *   every letter, and there's no third dictionary word to bridge them), verified via an independent
 *   BFS reference implementation before trusting it.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-10079-pizza-cutting", [{ input: "1\n2\n-1\n", output: "2\n4\n" }]);

  await seedFromSample("uva-10082-wertyu", [{ input: "2345\n", output: "1234\n" }]);

  await seedFromSample("uva-10106-product", [{ input: "0\n999\n", output: "0\n" }]);

  await seedFromSample("uva-10107-what-is-the-median", [{ input: "42\n", output: "42\n" }]);

  await seedFromSample("uva-10130-supersale", [
    { input: "1\n1\n10 5\n1\n5\n", output: "10\n" },
  ]);

  await seedFromSample("uva-10142-australian-voting", [
    { input: "1\n2\nAlice\nBob\n1 2\n1 2\n2 1\n", output: "Alice\n" },
    { input: "1\n2\nAlice\nBob\n1 2\n2 1\n", output: "Alice\nBob\n" },
  ]);

  await seedFromSample(
    "uva-10150-doublets",
    [{ input: "abcd\nwxyz\n\nabcd wxyz\n", output: "No solution.\n" }],
    0,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
