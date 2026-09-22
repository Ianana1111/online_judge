# Add every pair when its larger endpoint first appears

## Problem and constraints

For each `2<=N<=500`, sum `gcd(i,j)` over all unordered pairs `1<=i<j<=N`. Self-pairs are excluded and each pair appears once. Up to 100 lines are read before a terminating zero; queries may repeat or arrive out of order.

## Building the approach

The shared upper bound is small, so precompute all answers. When extending the set from `1..j-1` to `1..j`, every old pair remains and the only new pairs are `(1,j)` through `(j-1,j)`. Therefore

`total[j] = total[j-1] + sum_{i=1}^{j-1} gcd(i,j)`.

Compute each gcd with Euclid's algorithm through `std::gcd`. Once the table through 500 exists, every query is a direct lookup independent of query order.

## Walkthrough

For `N=3`, pairs `(1,2)`, `(1,3)`, and `(2,3)` each contribute 1, giving 3. Extending to 4 adds gcd values 1, 2, and 1, so the prefix becomes 7. Including `(4,4)` would incorrectly add 4.

## Why it works

For `j=1` there are no valid pairs and `total[1]=0`. Assume `total[j-1]` contains exactly every pair whose larger endpoint is at most `j-1`. The inner loop adds exactly all pairs whose larger endpoint is `j`, once each. These sets are disjoint and together form all pairs for `1..j`, proving the recurrence by induction.

## Complexity

For maximum `M=500`, preprocessing performs `O(M^2)` gcd calls, or `O(M^2 log M)` time, and uses `O(M)` space. Each query is `O(1)`.

## Common mistakes

- Including `i=j` self-pairs.
- Counting both `(i,j)` and `(j,i)`.
- Omitting pairs whose right endpoint equals `N`.
- Forgetting to carry `total[j-1]` into the next prefix.
- Assuming query values are sorted.
