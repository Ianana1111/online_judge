# Count inversions online with compressed Fenwick ranks

## Problem and constraints

Sort a sequence of distinct values increasingly using adjacent swaps and print the minimum number of swaps. `N<500000`, values range up to 999999999, and zero terminates input. The answer may exceed 32-bit range.

## Building the approach

An inversion is a pair `i<j` with `a[i]>a[j]`. Each adjacent swap of an inverted neighboring pair removes exactly one inversion, so the minimum swap count equals the initial inversion count.

Scan left to right. When processing `a[i]`, count earlier values greater than it. Sort a copy of all values to compress each into rank one through N. A Fenwick tree stores how many processed elements have each rank.

`prefix(rank)` counts previous values no greater than the current one. Since exactly `i` elements are already processed, `i-prefix(rank)` are greater and form new inversions with current position. Add this number, then insert the current rank.

## Walkthrough

For `9,1,0,5,4`, successive new inversion counts are 0, 1, 2, 1, and 2, totaling six.

An increasing sequence has zero. A descending sequence has `N(N-1)/2`, which exceeds a 32-bit integer near the maximum N.

## Why it works

An adjacent swap changes only the order of the swapped pair, so any operation reduces inversion count by at most one. Repeatedly swapping an adjacent inversion reaches sorted order and reduces the count by exactly one each time. Thus inversion count is both a lower bound and attainable.

During the scan, every inversion is counted exactly when its right endpoint arrives. Fenwick's prefix gives precisely the prior ranks not greater, so subtracting from the processed count gives all larger prior values and no others. The accumulated result is therefore the required inversion count.

## Complexity

Sorting and N Fenwick query/update operations take `O(N log N)` time. Arrays use `O(N)` space.

## Common mistakes

- Simulating bubble sort in `O(N^2)`.
- Accumulating the answer in 32 bits.
- Using raw values as Fenwick indices.
- Inserting the current value before querying and introducing an off-by-one error.
- Using rank zero, which prevents Fenwick updates from advancing.
