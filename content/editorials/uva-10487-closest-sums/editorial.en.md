# Precompute every legal pair sum and search around each target

## Problem and constraints

Given between two and one thousand integers, answer up to 24 queries. For each target, choose two different input elements whose sum is closest to it. The statement guarantees no tie between distinct closest sum values. Input ends with `N=0`; different element pairs may produce the same sum.

## Building the approach

One data set serves several queries, so precompute all sums `a[i]+a[j]` with `i<j` and sort them. The strict index relation ensures that one element is never paired with itself.

For a query `q`, `lower_bound` finds the first sum not smaller than `q`. Among sums on that side, it is the closest possible. Among smaller sums, only its immediate predecessor can be closest. Compare the absolute distances of these two candidates.

Handle boundaries carefully: if the lower bound is the end, begin with the largest sum; if it is the beginning, there is no predecessor. Output the selected sum, not the distance.

## Walkthrough

For values `3 12 17 33 34`, query 30 is bracketed by sums 29 and 36. Their distances are one and six, so the answer is 29. Query 1 lies below every pair sum and chooses the minimum, 15. Query 51 exactly matches `17+34`, giving distance zero.

## Why it works

Enumerating `i<j` produces every sum using distinct positions and no invalid self-pair. In the sorted list, the largest value below `q` is at least as close as any smaller value, and the smallest value at or above `q` is at least as close as any larger value.

`lower_bound` and its predecessor are exactly these two candidates. Comparing their absolute distances therefore finds the global nearest sum. The no-tie guarantee makes the required value unique.

## Complexity

There are `P=N(N-1)/2` sums. Building and sorting them costs `O(P log P)`, each query takes `O(log P)`, and storage is `O(P)`. At `N=1000`, there are 499500 sums.

## Common mistakes

- Starting `j` at `i` and reusing one element.
- Checking only the right side of the binary-search boundary.
- Taking a predecessor at `begin` or dereferencing `end`.
- Comparing signed differences instead of absolute distances.
- Printing the distance rather than the pair sum.
