/**
 * Standalone (no-collection) UVA problems, batch F (7 problems).
 *
 * Every problem here had a from-scratch reference solution run against its full scraped Sample first
 * (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for a
 * boundary case. No corrupted samples or special-judge problems found in this batch, but two real
 * bugs were caught and fixed in the reference solutions themselves before trusting them (see below).
 *
 * - uva-10539-almost-prime-numbers: an "almost prime" is any p^k (k>=2) for a prime p -- precomputed
 *   every such value up to 10^12 via a sieve of primes up to 10^6 (since p^2<=10^12 requires p<=10^6),
 *   sorted once, then answered each range query via binary search. Verified against the official
 *   sample. Boundary case covers the single value 4=2^2 (the smallest almost-prime, an uncontested
 *   fact from the definition itself) and the range [1,1] (1 has no prime factors at all, so it can't
 *   be "divisible by only a single prime" -- count 0).
 * - uva-10550-combination-lock: re-derived the exact rotation-direction convention from the official
 *   sample rather than the ambiguous prose -- confirmed by hand-tracing that CLOCKWISE motion
 *   *decreases* the dial number (not increases, the more intuitive-sounding guess) and
 *   counter-clockwise increases it, since only that convention reproduces the sample's first two
 *   cases (1350 for both "0 30 0 30" and "5 35 5 35") when combined with the stated "2 CW turns + 1
 *   CCW turn + final CW" procedure. Verified against the full 22-case official sample. Boundary case
 *   is the trivial all-equal-position case (dial already at 1, combination 1-1-1): every directional
 *   distance is 0, leaving just the three mandated full-turn constants, 720+360=1080.
 * - uva-1056-degrees-of-separation: caught two real bugs in the reference implementation itself before
 *   it matched the sample. (1) Relationships are NOT one per line -- the official sample packs all R
 *   relationships for a network onto a single line as 2*R space-separated names; the fix was to
 *   tokenize the entire remaining input by whitespace rather than assuming a line-per-relationship
 *   structure. (2) P (total headcount) can exceed the number of DISTINCT names that ever appear in any
 *   relationship -- the official sample's network #6 has P=5 but only 2 named people ever appear
 *   together, meaning 3 people have zero relationships at all and are trivially isolated; the BFS-only
 *   check (which only knows about named people) missed this entirely until an explicit `n < P` check
 *   was added to force DISCONNECTED whenever some people never appear in any relationship at all.
 *   Verified against the full 17-network official sample only after both fixes. Boundary case
 *   reproduces exactly that P-exceeds-named-count scenario in miniature: P=3, a single "a b"
 *   relationship, so the 3rd (unnamed) person is trivially disconnected from everyone.
 * - uva-10583-ubiquitous-religions: standard union-find, counting the number of distinct roots among
 *   1..n after processing all m same-religion pairs. Verified against the official sample (a ~1.28MB
 *   input, many students/pairs). Boundary case is the trivial n=1,m=0 case: a single student with no
 *   pairwise data at all is, by definition, their own sole religion -- count 1.
 * - uva-10603-fill: Dijkstra's algorithm (not plain BFS, since each pour operation's "cost" is the
 *   variable amount of water moved, not a uniform 1) over the (a+1)x(b+1)x(c+1) state space of the 3
 *   jugs' water levels, tracking the minimum cost to reach every individual water AMOUNT that appears
 *   in any jug across any reachable state, then reporting the largest such amount <= d. Verified
 *   against the full 22-case official sample. Boundary case is the trivial a=b=c=d=1: jug 3 starts
 *   full at exactly d=1 already, needing zero pours -- "0 1", independent of the Dijkstra search
 *   (the target is met by the very first, zero-cost state).
 * - uva-1062-containers: a stack is valid for this loading order iff its labels read non-increasing
 *   from bottom to top (the topmost/earliest-loaded ship must be on top); minimizing stack count is
 *   therefore equivalent, by Dilworth's theorem, to finding the length of the longest non-decreasing
 *   subsequence of the arrival sequence, computed via the standard patience-sorting "tails" array
 *   (replace the leftmost tail >= the new label, or append a new tail if none qualifies). Verified
 *   against the full 34-case official sample (including a 1000-character sequence) -- this caught a
 *   real direction bug in the first implementation attempt (built for the opposite, non-decreasing-
 *   stack rule), caught by diffing against the sample rather than by inspection. Boundary case
 *   contrasts the two extremes: "AAAA" (identical labels, trivially fits in 1 stack) and "ABCD"
 *   (strictly increasing arrivals, forcing 4 separate stacks since no later, larger label can ever be
 *   placed atop an earlier, smaller one).
 * - uva-10626-buying-coke: bounded memoized search over (cokes remaining, owned 1s, 5s, 10s) --
 *   for each purchase, tries every "insert value" v from 8 up to 8+10=18 (a bounded overpay window),
 *   and for each v enumerates every way to form it from owned coins to find the minimum-coin
 *   realization, applies the machine's greedy (fewest-coin) change for v-8 using its own unlimited
 *   reserve, and recurses. This bounded-overpay heuristic isn't a rigorously derived optimal
 *   algorithm, but it was validated empirically against the FULL official sample -- all 15 diverse
 *   cases, including the one genuinely tricky case where the "always insert a single 10" greedy stops
 *   being possible partway through (68 cokes wanted, only 43 ten-crown coins available) and the answer
 *   (93) requires real optimization, not just a simple pattern. Boundary case is the trivial C=1 with
 *   only a single 10-crown coin owned: pay with that one coin (1 coin inserted total), get 2 crowns
 *   change back (irrelevant, since only 1 coke was wanted) -- independent of the bounded-search DP,
 *   since there's only one coin available to insert at all.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("uva-10539-almost-prime-numbers", [{ input: "2\n4 4\n1 1\n", output: "1\n0\n" }]);

  await seedFromSample("uva-10550-combination-lock", [
    { input: "1 1 1 1\n0 0 0 0\n", output: "1080\n" },
  ]);

  await seedFromSample("uva-1056-degrees-of-separation", [
    { input: "3 1\na b\n0 0\n", output: "Network 1: DISCONNECTED\n" },
  ]);

  await seedFromSample("uva-10583-ubiquitous-religions", [{ input: "1 0\n0 0\n", output: "Case 1: 1\n" }]);

  await seedFromSample("uva-10603-fill", [{ input: "1\n1 1 1 1\n", output: "0 1\n" }]);

  await seedFromSample("uva-1062-containers", [
    { input: "AAAA\nABCD\nend\n", output: "Case 1: 1\nCase 2: 4\n" },
  ]);

  await seedFromSample("uva-10626-buying-coke", [{ input: "1\n1 0 0 1\n", output: "1\n" }]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
