/**
 * gpe-history collection, batch 8 (7 problems).
 *
 * Every problem here had a from-scratch reference solution run against its full scraped Sample
 * first (not hand-traced) to confirm the sample itself is trustworthy before using it as a base for
 * a boundary case. No corrupted samples or special-judge problems found in this batch.
 *
 * - gpe-10605-count-the-trees: answer(n) = Catalan(n) * n! (Catalan(n) counts unlabeled binary-tree
 *   *shapes* with n nodes, n! accounts for assigning n distinct labels to those n node positions).
 *   Verified exactly against all 4 official values, including the huge n=25 case (BigInt). Boundary
 *   case pushes to n=300, the stated upper bound, to confirm no overflow/precision issue at scale.
 * - uva-12063-zeros-and-ones: digit DP over bit position, ones-used, and remainder mod K
 *   (BigInt counts — the sample's own N=64 case is ~4.65e17, well past Number precision). Verified
 *   against the full 5-case sample including that large value. Boundary case covers N odd (always 0,
 *   regardless of K, since equal zero/one counts is impossible) and the smallest even N=2 with K=1.
 *   Deliberately did NOT touch K=0: the statement allows it (0 ≤ K ≤ 100) but never defines what
 *   "multiple of 0" means for a positive number, and the official sample never exercises it either —
 *   safer to leave that genuinely ambiguous case untested than guess a convention.
 * - gpe-10503-show-the-sequence: recursive-descent parser for the `[m+S]` / `[m*S]` / `[n]` bracket
 *   notation, then generates terms via the stated recurrences. Independently re-derived and verified
 *   BOTH of the problem statement's own worked examples by hand before running the code (not just
 *   the DB's scraped sample), giving two separate trusted anchors. Boundary case is a fresh
 *   mixed +/* nested expression the sample doesn't exercise.
 * - gpe-11174-homer-simpson: DP over reachable exact time sums using m/n-minute burgers, then finds
 *   the largest reachable time ≤ t (minimizing wasted "beer" time) and reports its burger count, with
 *   beer time appended only if that time is < t. Verified against both official cases, including the
 *   subtlety that maximizing burger count for a fixed sum means preferring more of the *smaller*
 *   duration item — confirmed by matching the sample rather than assumed. Boundary case covers t
 *   smaller than both m and n (forces 0 burgers, all beer) and a near-miss needing exactly 1 minute
 *   of beer.
 * - gpe-22181-dollars: standard unbounded coin-change *count* DP over NZ denominations in 5c units,
 *   BigInt (the sample's own $2.00 case is 293, but $300 pushes into the hundreds-of-trillions
 *   range). Note: the statement describes strict column-width formatting ("field of width 6" /
 *   "width 17"), but the actual scraped official sample uses plain single-space separation — trusted
 *   the sample's real format (this is what the local judge will actually compare submissions
 *   against) over the prose. Boundary case covers the smallest amount (5c, trivially 1 way) and the
 *   stated $300.00 maximum.
 * - gpe-23781-making-change: the harder, two-sided version — buyer pays from a *limited* personal
 *   coin supply (bounded knapsack DP for min coins to tender an exact amount T ≥ price), shopkeeper
 *   gives change from *unlimited* supply (standard unbounded min-coins DP), minimizing the combined
 *   total across all valid tendered amounts T. Cross-checked both official cases by hand against the
 *   problem statement's own worked example ("tender $1.05, get 50c change, total 3 coins") before
 *   trusting the code. Boundary case covers exact payment with no change needed at all, and a case
 *   forcing a larger, multi-coin change amount (95c back from a single $1 coin).
 * - gpe-23771-lexicographic-order: inverse permutation-ranking problem — given the k-th permutation
 *   string under an *unknown* alphabet order, recover that order. Solved by decoding k into Lehmer
 *   code digits (standard factorial-number-system), then reconstructing the order by processing
 *   string positions back-to-front and inserting each character into a running sorted list at the
 *   index given by its digit (since by the time position i is processed, the running list already
 *   holds the correctly-ordered relative ranking of every later character). Hand-derived and verified
 *   both official sample cases digit-by-digit before trusting the code, then let the code confirm the
 *   larger third case. Boundary case exploits two provable special cases as a second layer of
 *   verification: k=1 must return the input string completely unchanged (it's already ascending under
 *   its own alphabet), and k=n! (max rank) must return the exact reverse of the input string.
 */
import { prisma } from "@oj/db";
import { seedFromSample } from "./testcase-seed-helper.js";

async function main() {
  await seedFromSample("gpe-10605-count-the-trees", [{ input: "3\n300\n0\n", output: "30\n" + "137378075109762060429522738972632585081169755996049595188361243658628192249726585424703078414663990426229823305746828792866849418024321517460131177866511842670417171885915385919843693603797986405860478580069565298906600371579310154166721548846428218684263322725553658760862391903165742365600645662898605733848705603989890253098055146045842654434583716171812418194960627425513820552053238421359968191163606267378157023283379718208347819449062986359065168271437231036651857351986944963421139235563802238114937087626984902518808496820722208713144308210120038785326401201760417597035025538622856791030665572845418597666523901777796405781452023676412850909472964586763768638262987637255558541460374176087541426615261698457600000000000000000000000000000000000000000000000000000000000000000000000000\n" }]);

  await seedFromSample("uva-12063-zeros-and-ones", [
    { input: "2\n2 1\n3 5\n", output: "Case 1: 1\nCase 2: 0\n" },
  ]);

  await seedFromSample("gpe-10503-show-the-sequence", [
    { input: "[3+[1]] 2\n[3*[2+[4]]] 4\n", output: "3 4\n6 36 360 5040\n" },
  ]);

  await seedFromSample("gpe-11174-homer-simpson", [{ input: "3 5 1\n3 5 4\n", output: "0 1\n1 1\n" }]);

  await seedFromSample("gpe-22181-dollars", [{ input: "0.05\n300.00\n0.00\n", output: "0.05 1\n300.00 181490736388615\n" }]);

  await seedFromSample("gpe-23781-making-change", [
    { input: "1 0 0 0 0 0 0.05\n0 0 0 0 1 0 0.05\n0 0 0 0 0 0\n", output: "1\n5\n" },
  ]);

  await seedFromSample("gpe-23771-lexicographic-order", [
    { input: "3\nz 1\nqwert 1\nqwert 120\n", output: "Case 1: z\nCase 2: qwert\nCase 3: trewq\n" },
  ]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
