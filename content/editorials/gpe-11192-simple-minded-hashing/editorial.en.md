# Count increasing strings as letter subsets

## Problem and constraints

Letters `a` through `z` have values 1 through 26. For each query, count strings of length `L` whose value sum is `S` and whose letters are strictly increasing. Input values may be as large as 9999, although a valid string can contain at most 26 letters and has maximum sum 351. The pair `0 0` ends input. Strict increase forbids repeated letters and fixes their order.

## Building the approach

The ordering condition removes a choice rather than adding one. Once a set of letters has been selected, there is exactly one legal string: write those letters in increasing order. So the task is to count subsets of `{1,...,26}` containing `L` numbers with sum `S`.

Let `count[len][sum]` be the number of such subsets among letters processed so far. The empty subset gives `count[0][0]=1`. When processing value `v`, every old subset may skip it, while a subset that uses it comes from a previous state with one fewer element and sum `sum-v`.

Update `len` and `sum` downward. This ensures the source still describes the table before `v` was selected, so one letter cannot be used twice. The entire table is precomputed once; each query is then a lookup. Queries outside length 26 or sum 351 immediately return zero.

## Walkthrough

For `L=3, S=10`, the valid value sets are `{1,2,7}`, `{1,3,6}`, `{1,4,5}`, and `{2,3,5}`. They correspond to `abg`, `acf`, `ade`, and `bce`, so the answer is four. `agb` is not an additional arrangement because it is not increasing, and repeated letters such as `aa` are invalid.

At `L=26, S=351`, only the complete alphabet works. Any request with `L=27` is impossible regardless of the supplied sum.

## Why it works

Induct on the processed letter values. For a new value `v`, every valid subset either excludes `v`, in which case it was already counted, or includes `v`, in which case removing `v` yields a unique old subset with one fewer item and smaller sum. These cases are disjoint and exhaustive. Descending updates prevent the same `v` from entering its own source state.

Finally, a selected subset maps to exactly one strictly increasing string and every legal string maps back to its letter subset. Therefore the dynamic-programming count is exactly the requested answer.

## Complexity

Precomputation uses `O(26 * 26 * 351)` time and `O(26 * 351)` space. Each query takes `O(1)` time.

## Common mistakes

- Multiplying by permutations even though increasing order is fixed.
- Updating forward and selecting the same letter more than once.
- Allocating a huge table based on the query limit instead of the real alphabet bounds.
- Forgetting the base state `count[0][0]=1`.
- Treating strictly increasing as nondecreasing.
