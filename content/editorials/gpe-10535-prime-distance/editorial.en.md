# Use parity to limit the occupied positions

## Problem and constraints

Place M identical coins in a row of N cells. Any cell may hold multiple coins, but the distance between every pair of distinct occupied cells must be prime. N and M are positive and at most 100,000, with at most 2,000 cases. Count arrangements modulo 1,000,000,007. Despite the title, this is a placement-counting problem, not a search for neighboring primes in an interval.

## Building the approach

Separate two decisions: which cells are occupied, and how many coins each receives. Without a structural observation there seem to be far too many cell subsets. Look at parity: two occupied positions of the same parity have an even distance, which can be prime only if it is two. Three positions of one parity cannot all be two apart. Thus at most two even and two odd positions can be occupied: only one through four occupied cells need consideration.

One occupied cell has N choices. Two occupied cells at prime distance p have N − p translations within the row.

With three cells, the same-parity pair is two apart. The third cell cannot lie between them, where its distances would be one. Outside the pair, its two distances must be twin primes p and p + 2. Each twin-prime pair gives two reflected shapes, each with N − (p + 2) translations.

With four cells, there are two same-parity pairs, each two apart. After translating the leftmost cell to zero, the shape is `{0, 2, q, q+2}`. Its cross-pair distances require q − 2, q, and q + 2 to be prime. One of these three odd numbers is divisible by three, so only `3, 5, 7` works. The unique shape is therefore `{0, 2, 5, 7}`, with `max(N − 7, 0)` translations.

For K fixed occupied cells, distribute the M coins into K positive amounts: choose K − 1 separators among M − 1 gaps, giving `C(M−1, K−1)`. Multiply by the position count and sum over K. Prefix counts and sums of primes and twin-prime spans make each position count a constant-time expression.

## Walkthrough

For N = 3 and M = 2, putting both coins in one cell gives three arrangements. The only valid two-cell choice is the first and third cells, with one coin each. The answer is four. For N = 8 and M = 4, the contributions for one through four occupied cells are 8, 45, 24, and 1, totaling 78. The last arrangement occupies positions 1, 3, 6, and 8.

## Why it works

Parity excludes five or more occupied cells. The distance arguments characterize every possible shape for two, three, and four cells, and each listed shape has only prime pairwise distances. Translating by the leftmost position counts each placement once. For a fixed placement, positive compositions correspond bijectively to separator choices. Summing over the disjoint occupied-cell counts therefore counts every valid arrangement exactly once.

## Complexity

A sieve and prefix tables through U = 100,000 take O(U log log U) time and O(U) space. Each query uses four terms and takes O(1) time. Reduce products modulo the modulus before they can exceed 64-bit range.

## Common mistakes

- Assuming only two cells can be occupied.
- Missing the reflected three-cell shapes.
- Treating identical coins as distinct or allowing an occupied cell to receive zero.
- Using N − 8 instead of N − 7 for the four-cell shape.
- Multiplying unreduced combination and placement counts in 64-bit arithmetic.
