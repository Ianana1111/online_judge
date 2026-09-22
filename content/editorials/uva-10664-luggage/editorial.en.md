# Reduce equal partition to a zero-one subset-sum target

## Problem and constraints

Each test line contains the weights of one through twenty indivisible luggage items, with total weight at most 200. Determine whether every item can be split between two vehicles with equal total weight. The line has no leading item count.

## Building the approach

If the total is odd, equal division is impossible. For an even total, choosing one vehicle's items with sum `target=total/2` automatically leaves the other vehicle the same weight. The problem is therefore zero-one subset sum.

Let `reachable[s]` mean that processed items can form sum `s`. Initially only zero is reachable. For each weight `w`, update sums from `target` down to `w`:

`reachable[s] |= reachable[s-w]`.

Descending order is essential. The smaller source index has not yet been updated for this item, so the same suitcase cannot be reused in one iteration.

## Walkthrough

Weights `1,5,11,5` total 22. One vehicle can take 11 while the other takes 1,5,5, so the answer is `YES`.

Weights `1,2,5` total eight but no subset sums to four, so the answer is `NO`. Updating sums upward would wrongly reuse the one-kilogram item and could claim four is reachable.

## Why it works

Before processing any items, only the empty subset with sum zero exists. For a new item `w`, a subset of sum `s` either omits it, preserving the old `reachable[s]`, or uses it once together with an old subset of sum `s-w`. The descending loop ensures the source describes only earlier items.

Induction over items proves the table contains exactly all achievable subset sums. For an even total, reachability of half is equivalent to a complete equal partition, since all unselected items have the complementary half sum.

## Complexity

With `N<=20` and `target<=100`, time is `O(N*target)` and DP space is `O(target)`, plus the parsed weights.

## Common mistakes

- Treating the first weight on a line as an item count.
- Truncating half of an odd total.
- Updating subset sums upward and reusing one item repeatedly.
- Checking only for a single item equal to half.
- Failing to consume the newline after the test count.
