# Binary-search a partition for the N-th merged element

## Problem and constraints

Two strictly increasing arrays of length `N` are defined by quadratic formulas. Their coefficients are positive, indices run from zero through `N-1`, and all resulting values fit signed 64-bit integers. Among the combined `2N` elements, find the N-th smallest value. Equal values from different arrays remain separate elements. With `N` up to `10^7`, generating and sorting both arrays is wasteful.

## Building the approach

Imagine cutting the merged sorted order after its first `N` elements. If the left side takes `takeA` elements from array A, it must take `takeB=N-takeA` from B. Therefore one cut determines the other.

The partition is correct when every left element is at most every right element. Because each individual array is sorted, only two cross-boundary comparisons are needed: `aLeft <= bRight` and `bLeft <= aRight`.

If `aLeft>bRight`, too many A elements were taken, so reduce `takeA`. If `bLeft>aRight`, too few A elements were taken, so increase it. Binary-search `takeA` from zero to N. Empty sides use negative or positive infinity sentinels.

At a valid partition, the left side contains exactly the first N elements, so its maximum `max(aLeft,bLeft)` is the N-th smallest value.

## Walkthrough

For A=`[2,6,14]`, B=`[3,6,11]`, and `N=3`, take one from A and two from B. The left sides end at 2 and 6; the right sides begin at 6 and 11. Both boundary conditions hold, so the answer is 6.

The merged order is `2,3,6,6,11,14`. Both copies of 6 count, confirming that deduplication would corrupt the rank.

## Why it works

At a valid partition, internal sortedness and the two cross comparisons imply that every left element is no greater than every right element. Since the left side has exactly N elements, its maximum is the N-th element with multiplicity.

When `aLeft>bRight`, taking still more from A cannot help: A's left boundary can only increase while B's right boundary can only decrease. Thus every valid cut lies to the left. The opposite violation symmetrically requires moving right. Binary search removes only impossible cuts and must reach a valid one.

## Complexity

Each iteration evaluates four quadratic terms in `O(1)`. Time is `O(log N)` and extra space is `O(1)`; neither source array is materialized.

## Common mistakes

- Interpreting the N-th element as zero-based index N.
- Removing equal values from different arrays.
- Comparing only the two left boundaries.
- Reading indices `-1` or `N` at an empty partition side.
- Computing polynomial products in 32-bit arithmetic.
