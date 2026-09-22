# Count the pairs whose relative order must be reversed

## Problem and constraints

The cars form a permutation of `1..L`. We may swap only neighboring cars and must find the minimum number of swaps needed to put them in increasing order. Here `0 <= L <= 50`, so an empty train is a valid case with answer zero. The required sentence and its final period must be printed exactly.

## Building the approach

Consider two positions `i < j`. If `cars[i] > cars[j]`, those two cars appear in the wrong relative order and must trade places before the train can be sorted. Such a pair is an inversion.

An adjacent swap reverses the relative order of exactly the two cars being swapped; it does not change either car's order relative to any third car. Consequently, one swap can remove at most one inversion. This gives a lower bound: every solution needs at least as many swaps as the initial inversion count.

The bound is attainable. Whenever a permutation is not sorted, it has a neighboring inverted pair. Swapping that pair removes exactly one inversion. Repeating this is bubble sort, and it stops after precisely the original number of inversions. Therefore we only need to count every pair `i < j` with `cars[i] > cars[j]`; there is no need to perform the swaps.

## Walkthrough

For `3 1 2`, the inverted pairs are `(3,1)` and `(3,2)`. Swapping neighbors can produce `1 3 2` and then `1 2 3`, so the answer is two. An increasing train has no inversions. A reversed train of length five has every pair inverted, giving `5 * 4 / 2 = 10`. With zero cars, the pair loops simply do no work.

## Why it works

Every inverted pair must reverse its relative order, while one adjacent swap reverses only one pair, so no valid sequence uses fewer swaps than the inversion count. Conversely, swapping adjacent inversions repeatedly removes one inversion per operation and eventually leaves none, which means the permutation is increasing. Thus a sequence using exactly the inversion count exists, and the double loop returns the minimum.

## Complexity

The algorithm takes `O(L^2)` time and `O(L)` space for the input array. The maximum count is `50 * 49 / 2 = 1225`, which fits in an `int`.

## Common mistakes

- Counting only neighboring inversions instead of all pairs.
- Solving the version where any two cars may be swapped.
- Treating `L = 0` as the end of all test cases.
- Counting both `(i,j)` and `(j,i)`.
- Omitting the final period in the required output.
