# Count maximum-displacement permutations through saturated cuts

## Problem and constraints

Count permutations of 1 through `n` whose sum of `|a_i-i|` equals the maximum `floor(n^2/2)`, modulo 1,000,000,007. Here `n` reaches one million and up to 1,000 queries continue to EOF. The reverse permutation is not the only maximizer.

## Building the approach

Across the cut after position `k`, let `c_k` left positions receive right-side values. Conservation gives the same number crossing backward, so total displacement is `2*sum c_k`. Each cut has capacity `min(k,n-k)`; reaching the global maximum forces every cut to saturate.

For `n=2m`, saturation means the first half contains all larger values and the second all smaller values. Each half may be permuted freely, giving `(m!)^2`. For `n=2m+1`, separating whether middle value `m+1` lies at the center, left, or right gives `(m!)^2 + m(m!)^2 + m(m!)^2 = n(m!)^2`. Precompute factorials through the largest `floor(n/2)`.

## Walkthrough

For `n=3`, the three maximizers are `231,312,321`. For `n=4`, the first two positions contain 3 and 4 in either order and the last two contain 1 and 2, producing four permutations. For `n=1`, `0!=1` and the odd factor one gives one.

## Why it works

The cut identity and capacities prove saturation is necessary. For even size, the central saturated cut forces complete half exchange, which also saturates every other cut; internal orders are unrestricted. For odd size, the two central cuts restrict the middle value to the three stated regions. Counting its position and the value occupying the center yields the two `m(m!)^2` side cases, while the center case yields `(m!)^2`. These disjoint cases are complete and satisfy all cut bounds, proving the formula.

## Complexity

For largest input `N` and `Q` queries, preprocessing is `O(N)`, each answer `O(1)`, and storage `O(N+Q)` including buffered queries.

## Common mistakes

- Assuming only the reversed permutation is maximal.
- Omitting the odd-size factor `n`.
- Using ceiling instead of floor for half size.
- Enumerating permutations or checking floating-point target values.
- Multiplying residues in 32 bits.
