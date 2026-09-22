# Count inversions: each one requires exactly one adjacent swap

## Problem and constraints

Given `N` integers, sort them into nondecreasing order using only swaps of adjacent positions. Print the minimum number of swaps. `1 <= N <= 1000`, cases continue until end of file, and equal values do not need to exchange their relative order.

## Building the approach

An inversion is a pair of indices `i<j` with `a[i]>a[j]`. Those two values appear in the wrong relative order and must reverse their order before the sequence is sorted.

An adjacent swap changes only the relative order of the two swapped elements; every other pair keeps the same order. Therefore one useful adjacent swap can remove only one inversion. Conversely, whenever the sequence is not sorted, it contains an adjacent inverted pair. Swapping such a pair removes exactly one inversion. Repeating reaches a sorted sequence after exactly as many swaps as the initial inversion count.

With at most 1000 values, simply inspect every pair `i<j` and count strict comparisons `a[i]>a[j]`. No actual sorting or more advanced data structure is required for this bound.

## Walkthrough

For `2 3 1`, the inversions are `(2,1)` and `(3,1)`, so the answer is two. Swapping adjacent `3,1` gives `2 1 3`, and swapping `2,1` gives `1 2 3`.

For `2 2 1`, there are also two inversions, one between each copy of two and the final one. The equal pair of twos is not an inversion, which is why the comparison must be strict rather than `>=`.

## Why it works

Let the initial inversion count be `I`. A single adjacent swap affects only one pair's relative order, so it can decrease the inversion count by at most one. A sorted sequence has zero inversions, establishing a lower bound of `I` swaps.

While an inversion exists, there is also an adjacent inversion; otherwise every neighboring pair would be ordered and the whole sequence would be nondecreasing. Swapping such a pair decreases the inversion count by exactly one. Thus a sequence of exactly `I` legal swaps reaches zero inversions. The lower bound is attainable, so the counted `I` is the minimum.

## Complexity

The two nested loops take `O(N^2)` time and the input array uses `O(N)` space. The maximum count is `N(N-1)/2`; the implementation stores it in `long long`.

## Common mistakes

- Counting arbitrary-position swaps instead of adjacent swaps.
- Counting only adjacent inversions and missing distant pairs.
- Treating equal values as inversions.
- Sorting the array before counting and destroying the original order.
- Reading a fixed number of cases instead of continuing to EOF.
- Changing the required output sentence or punctuation.
