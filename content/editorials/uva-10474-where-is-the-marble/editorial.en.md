# Sort the marbles and use lower_bound for the first occurrence

## Problem and constraints

Sort the numbered marbles in increasing order. For each query, print the one-based position of the first marble with that value, or report that it was not found. Input contains multiple cases and ends only when both `N` and `Q` are zero. Values, including zero, range from zero through 10000, and duplicate marbles must be preserved.

## Building the approach

After sorting, we need the boundary between values smaller than `x` and values at least `x`. `lower_bound` returns exactly the first position whose value is not less than `x`.

If that iterator is valid and its value equals `x`, no earlier position can contain `x`, so its index is the requested first occurrence. If it is the end, every marble is smaller. If it points to a larger value, all later values are also too large. In both latter cases, `x` is absent.

Do not remove duplicates: they affect the one-based ranks of every larger number.

## Walkthrough

Marbles `5 1 3 3 1` sort to `1 1 3 3 5`. Query 3 has lower-bound index two, so its one-based position is three. Query 2 reaches the same first 3, but the value is not equal and must be reported missing.

Query 6 returns the end iterator, which cannot be dereferenced. A case may also have zero marbles and positive queries; only the pair `0 0` terminates input.

## Why it works

Sorting places every value below `x` before every value at least `x`. `lower_bound` returns their boundary, so nothing to its left equals `x`. If the boundary value is `x`, it is therefore the first occurrence. If the boundary is larger, monotonic order excludes `x` from the suffix; if no boundary exists, the entire array is smaller.

These cases cover all possibilities, and adding one to a valid zero-based index produces the required rank.

## Complexity

Sorting takes `O(N log N)`. Each of `Q` queries takes `O(log(N+1))`, and the marble array uses `O(N)` space.

## Common mistakes

- Using `upper_bound` and returning a position after the duplicates.
- Removing duplicate marbles and changing later ranks.
- Treating the insertion position as a match without checking equality.
- Dereferencing the end iterator.
- Forgetting to convert to one-based position.
- Terminating when either count is zero rather than when both are zero.
