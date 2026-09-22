# Use a complement for one success and logarithms for all successes

## Problem and constraints

On draw k, two urns contain k and k + 1 balls, each with one red ball. Drawn balls are replaced, then a white ball is added to each urn. For N < 1,000,000, find the probability of at least one simultaneous-red draw and the number of leading fractional zeros in the probability that all N draws are simultaneous red.

There are at most 1,000 queries; print the first probability to six decimal places. For N = 0, the platform defines the answers as zero probability and zero leading zeros, since the all-zero-draws event has probability one.

## Building the approach

One simultaneous-red draw has probability `pₖ = 1/[k(k+1)]`. Adding these probabilities would double-count outcomes with several successes. Instead, calculate the complement: `1 − ∏(1−pₖ)`.

All draws succeeding has probability `∏pₖ = 1/[N!(N+1)!]`. This quickly underflows ordinary floating point. We need only its decimal position, so compute `L = 2 log₁₀(N!) + log₁₀(N+1)` and return floor(L). For N ≥ 1 the denominator is not an exact power of ten: at N = 1 it is two, and afterward it contains factor three.

Sort queries by N and advance one shared prefix computation. Sum `log1p(-pₖ)` for the no-success probability and recover its complement with `-expm1(sum)`. These functions avoid subtractive loss near zero. Kahan compensation reduces error in both long accumulated logarithmic sums.

## Walkthrough

For N = 2, at least one success has probability `1 − (1−1/2)(1−1/6) = 7/12`, printed as `0.583333`. All successes have probability 1/12 = 0.08333…, containing one zero before the first nonzero fractional digit. At N = 20, the all-success probability has 38 such zeros, which can be found without representing that tiny probability directly.

## Why it works

Replacement makes the draws independent, so both event products are valid. Complementation gives at least one success. If the denominator lies strictly between 10ᵏ and 10ᵏ⁺¹, its reciprocal's first nonzero digit is at fractional position k + 1, giving k = floor(L) leading zeros. Sorted processing computes the correct prefix for every query, and saved original indices restore output order.

## Complexity

O(Q log Q + U) time for Q queries and largest requested N = U, with O(Q) space. Repeated queries share all prefix work.

## Common mistakes

- Adding success probabilities or using only the final draw.
- Multiplying the all-success probability until it becomes zero.
- Omitting the second factorial.
- Rounding the logarithm instead of taking its floor.
- Losing original query order after sorting.
