# Fix the first car and extend heavier and lighter chains

## Problem and constraints

Cars arrive in fixed order. Each may be rejected, prepended, or appended, and the final train must strictly decrease in weight from front to back. Up to 2,000 distinct nonnegative weights are given, and an empty sequence is allowed. Cars cannot be inserted in the middle or reordered in arrival time.

## Building the approach

Fix the earliest accepted car at index `i`. Every later accepted car lies after it in input. Cars added to the front must form an increasing-weight chain beginning at `i`, while cars added to the rear form a decreasing-weight chain beginning at `i`.

Let `rise[i]` and `fall[i]` be their maximum lengths. Process indices right to left. For every `j>i`, a heavier `weight[j]` can extend `rise[j]`, while a lighter one can extend `fall[j]`. The two chains share only the fixed first car, so their combined length is `rise[i]+fall[i]-1`. Maximize this over all starts.

The implementation converts normalized decimal weight strings into order-preserving ranks, avoiding an unstated fixed-width assumption while retaining all comparisons.

## Walkthrough

For arrival order `3,1,4,2`, accept 3, append 1, and prepend 4 to obtain `4,3,1` of length 3. Car 2 cannot then be inserted in the middle. At start 3, the heavier chain `3,4` and either lighter chain `3,1` or `3,2` combine as `2+2-1=3`. A fully increasing arrival sequence can all be accepted by repeatedly prepending.

## Why it works

In any valid train whose earliest accepted car is `i`, later cars placed at the front must become successively heavier and those placed at the rear successively lighter, so its size is at most `rise[i]+fall[i]-1`. Conversely, choose optimal heavier and lighter chains. Apart from `i`, all values in one are above its weight and all in the other below, so they cannot overlap. Processing them in actual arrival order and placing them on their designated ends preserves strict descent. The bound is attainable for every `i`; taking the maximum is optimal.

## Complexity

The dynamic program takes `O(N^2)` time and `O(N)` state. Ranking stores `O(N)` strings and indices; its comparisons add sorting overhead below the quadratic DP bound for ordinary input sizes.

## Common mistakes

- Running a standard bitonic subsequence in the wrong arrival direction.
- Computing only the increasing or decreasing side.
- Forgetting to subtract the doubly counted first car.
- Allowing insertion between existing cars.
- Returning one instead of zero when `N=0`.
