# Keep the smallest withdrawal amount for the most collected types

## Problem and constraints

A bank repeatedly gives the largest coin denomination not exceeding the remaining withdrawal amount. We may choose the amount and want to maximize the number of distinct denominations received. Denominations are strictly increasing, begin with 1, and number at most 1,000. The goal is distinct types, not the total coin count.

## Building the approach

Any solution using multiple copies of one denomination can discard extra copies without losing a type. The smaller amount is less likely to trigger a larger coin, so it is enough to seek a representation containing one coin of each chosen type.

Scan denominations from smallest upward and let `sum` be the smallest amount representing the types selected so far. Include `coin[i]` only if `sum + coin[i] < coin[i+1]`. Equality is not enough: if the remaining amount reaches the next denomination, the bank takes that larger coin first. The greatest denomination is always included at the end because no larger type can displace it.

## Walkthrough

For `1,2,4,8`, the selected prefix sums are 1, 3, and 7, each strictly below the next denomination, so all four types can appear. For `1,2,3`, trying to include 2 gives sum 3, at which point the bank would choose denomination 3 instead. The best choice is types 1 and 3, for a total of two types.

## Why it works

Before each denomination, `sum` is the minimum withdrawal amount that realizes the maximum number of selected smaller types and remains below the current denomination. If adding the current coin stays below the next denomination, it safely increases the number of types. If even this minimum amount reaches the next denomination, no solution with the same number of previous types can include the current coin without triggering the larger one. Dropping a previous type could at best keep the same count and would not improve the maintained minimum. Thus each choice preserves the invariant. Finally including the largest denomination yields the global maximum.

## Complexity

Each denomination is considered once, for `O(N)` time. The implementation stores the input in `O(N)` space and uses `O(1)` additional working state.

## Common mistakes

- Using `<=` and accepting an amount equal to the next denomination.
- Assuming every denomination can appear together.
- Forgetting to count the largest denomination.
- Maximizing the number of coins rather than distinct types.
- Comparing only the current and next coins while ignoring the selected prefix sum.
