# Enumerate six-number combinations with increasing indices

## Problem and constraints

From `k` distinct integers already sorted increasingly, print every choice of six numbers. Here `7 <= k <= 12`, values are from 1 through 49, each row must increase, and rows must appear in lexicographic order. Input ends with `k = 0`, and consecutive datasets are separated by exactly one blank line.

## Building the approach

Represent a combination by six increasing indices. After choosing index `i`, recurse only from `i+1`; this simultaneously prevents repeated values and different permutations of the same subset.

The recursive state stores the next index `start` and the current prefix `chosen`. When its size reaches six, print it. Otherwise try candidates in increasing index order, append one, recurse, and remove it on return.

Prune candidates that leave too few elements. If `needed` values remain including the next choice, index `i` is possible only when the suffix length `k-i` is at least `needed`, or equivalently `i <= k-needed`. Trying indices in ascending order and completing each suffix before advancing produces lexicographic output directly.

## Walkthrough

For `1 2 3 4 5 6 7`, fixing `1 2 3 4 5` yields rows ending in 6 and 7. Backtracking then changes the fifth choice to 6, forcing the last choice to 7. Continuing produces seven rows in total, from `1 2 3 4 5 6` through `2 3 4 5 6 7`.

## Why it works

Every recursive choice uses an index after the preceding one, so each printed row contains six distinct increasing values. Conversely, every six-element subset has one unique increasing index sequence, and the recursion follows exactly that sequence, proving completeness and uniqueness. Ascending candidate order is lexicographic depth-first order. The bound removes only suffixes with fewer elements than required, so it cannot remove a valid row.

## Complexity

There are `C(k,6)` output rows, each containing six values, so time is `O(6*C(k,6))`. Input storage uses `O(k)` space, while recursion and the chosen prefix use at most six elements.

## Common mistakes

- Restarting recursion from zero and generating permutations or duplicates.
- Passing `i` rather than `i+1` and reusing an element.
- Using a strict pruning bound and losing combinations containing the last value.
- Forgetting the blank line between datasets.
- Testing `k = 6` as required input even though it is outside the declared range.
