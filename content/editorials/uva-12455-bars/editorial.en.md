# Use zero-one subset-sum updates for bars chosen at most once

## Problem and constraints

Choose some of 1 through 20 bars, without cutting or reusing any bar, to make an exact target from 0 through 1,000. The empty subset makes target zero achievable.

## Building the approach

Let `possible[s]` mean that processed bars contain a subset summing to `s`. Initially only `possible[0]` is true. For a bar of length `w`, update sums from the target downward: `possible[s] |= possible[s-w]`.

Descending order ensures the source state has not used the current bar, enforcing the zero-one choice. Oversized positive bars can be ignored after being read, but all case input must still be consumed.

## Walkthrough

Target 7 with bars 2, 3, and 5 succeeds through 2+5. Target 4 with only one bar of length 2 fails; an ascending update would wrongly reuse it. Target zero succeeds before any bar is processed.

## Why it works

Initially the table describes the sole empty subset. For each bar, every new subset either excludes it and preserves an old state, or includes it and corresponds to an old subset of sum `s-w`. Descending updates read only old states. Induction therefore makes the final target entry equivalent to existence of a legal subset.

## Complexity

For `P` bars and target `N`, time is `O(PN)` and extra space is `O(N)`.

## Common mistakes

- Updating upward and allowing unlimited reuse.
- Rejecting target zero.
- Checking only whether the total length is large enough.
- Deduplicating equal-length physical bars.
