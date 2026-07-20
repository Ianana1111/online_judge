/**
 * gpe-history collection, batch 13 (6 problems; 7th candidate excluded, see below).
 *
 * - gpe-10741-the-grand-dinner (uva-10249) was pulled from this batch entirely and left with 0
 *   TestCase rows. It's explicitly a special-judge problem: "If such an arrangement is possible you
 *   must also output one possible seating arrangement. If there are multiple possible arrangements,
 *   any one is acceptable." A reference solution (greedy: process teams by descending size, assign
 *   each team's members to the currently-highest-remaining-capacity tables) exactly reproduces the
 *   official sample's specific arrangement, but a different, equally valid greedy tie-break or
 *   processing order could legally produce a different-looking (but still correct) seating assignment.
 *   Seeding exact-diff TestCase data for the "print an arrangement" part of the output would fail any
 *   submission that finds an equally valid but different-looking arrangement -- same reasoning as
 *   gpe-10658-is-bigger-smarter and gpe-10906-matrix-decompressing.
 *
 * Every problem below had a from-scratch reference solution run against its full scraped Sample first
 * (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for a
 * boundary case. No corrupted samples found in this batch.
 *
 * - uva-10032-tug-of-war: 0/1-knapsack-style reachability DP over (people count, weight sum) to find,
 *   among the team-size split(s) allowed by the "differ by at most 1" rule (exactly n/2 if n is even,
 *   both (n-1)/2 and (n+1)/2 if n is odd), the achievable sum closest to total/2. Verified against the
 *   full 10-case official sample, including the input's blank-line-separated-cases format and the
 *   output's own blank-line-separated-cases format (both explicitly required by the statement and
 *   both present in the real sample, unlike some other problems in this collection where the stated
 *   blank-line rule turned out not to match the real data). Boundary case is the smallest possible
 *   input, 2 people both weighing 1: forced perfectly even split, 1 and 1.
 * - gpe-10432-mine-sweeper (uva-10279): classic Minesweeper board reveal -- if any touched cell is
 *   itself a mine, the game is over and *all* mines are shown as '*' everywhere on the board;
 *   otherwise mines stay completely hidden ('.') and only touched safe cells show their count of
 *   adjacent (8-directional) mines. Verified against the official sample (a non-exploded partial
 *   game). Boundary case explicitly covers both branches of that mine-touched/not-touched condition on
 *   a minimal 2x2 grid, since the single official sample only ever exercises the "not touched" branch:
 *   one 2x2 game where the only touched cell is safe (shows its adjacency count, the mine itself stays
 *   hidden), and one where the touched cell *is* the mine (every mine position -- just the one here --
 *   is revealed as '*').
 * - gpe-10468-maximum-product (uva-11059): brute-force O(n^2) all-contiguous-subarray products via
 *   BigInt (n <= 18, values in [-10,10], so a full-length product can reach magnitude 10^18, past
 *   JS's safe-integer range for a plain Number), keeping only the best strictly-positive product, or 0
 *   if none exists. Verified against the official sample. Found a real statement/sample mismatch: the
 *   statement says to print a blank line after every test case, but the actual official sample has no
 *   blank lines anywhere -- trusted the sample's real formatting (same precedent as several other
 *   problems in this collection), and also matched the sample's actual "Case #M: ... product is P."
 *   punctuation exactly rather than the statement's own (differently spaced) literal text. Boundary
 *   case is the sharpest edge of "no positive product possible": a single negative element (-5) on its
 *   own, where the only subarray is that one negative number, forcing the fallback answer of 0.
 * - gpe-2015-01-missing-numbers (uvaId=null, no external oracle beyond this DB's own
 *   statement+sample): since list i+1 is list i with exactly one value removed (shuffled), the missing
 *   value is simply the XOR of every element of list i XORed with every element of list i+1 (all
 *   shared values cancel out in pairs regardless of order or duplicates, leaving just the one unpaired
 *   value) -- applied M-1 times across consecutive list pairs. Verified against the official sample.
 *   Boundary case uses the smallest possible M=2 (a single gap to find, no chained XOR-cancellation
 *   across more than one pair to get subtly wrong) with a tiny hand-checkable list (missing value 7,
 *   confirmed by inspection, not just by trusting the XOR code).
 * - gpe-23581-glass-beads (uva-719): Booth's algorithm (O(n) least-rotation-of-a-string) to find the
 *   1-indexed starting position of the lexicographically smallest cyclic rotation, with ties broken by
 *   the lowest index. Verified against all 4 official cases. As an extra independent check (not just
 *   trusting Booth's algorithm's own internal correctness), every verification run also cross-checked
 *   Booth's result against a brute-force O(n^2) "generate and compare all n rotations directly"
 *   reference for every sample and boundary string, and both always agreed. Boundary case covers a
 *   single-character string (trivially rotation-invariant, answer must be 1) and an all-identical-
 *   character string ("bbb", every rotation is identical, so the *lowest-index* tie-break rule alone
 *   determines the answer, which must be 1).
 * - uva-10533-digit-primes: sieve of Eratosthenes up to the stated 10^6 bound, mark every prime whose
 *   own digit sum is also prime ("digit primes"), then answer each of up to 500,000 range queries in
 *   O(1) via a precomputed prefix-count array. Verified against the full 34-query official sample.
 *   Boundary case is the tightest possible query, a single-value range [2,2]: 2 is prime, its digit
 *   sum is 2 (itself prime), so it's a digit prime and the count is 1 -- a fact checkable directly from
 *   the problem's own definition, independent of the sieve implementation.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-10032-tug-of-war", [{ input: "1\n\n2\n1\n1\n", output: "1 1\n" }]);

  await seedFromSample("gpe-10432-mine-sweeper", [
    { input: "1\n2\n*.\n..\n..\n.x\n", output: "..\n.1\n" },
    { input: "1\n2\n*.\n..\nx.\n..\n", output: "*.\n..\n" },
  ]);

  await seedFromSample("gpe-10468-maximum-product", [
    { input: "1\n-5\n", output: "Case #1: The maximum product is 0.\n" },
  ]);

  await seedFromSample("gpe-2015-01-missing-numbers", [
    { input: "2 3\n5 7 9\n5 9\n", output: "7\n" },
  ]);

  await seedFromSample("gpe-23581-glass-beads", [{ input: "2\na\nbbb\n", output: "1\n1\n" }]);

  await seedFromSample("uva-10533-digit-primes", [{ input: "1\n2 2\n", output: "1\n" }]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
