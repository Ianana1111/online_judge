# Keep only profitable prefixes with Kadane's algorithm

## Problem and constraints

A sequence records gambling gains as positive values and losses as negative values. Find the maximum positive sum of any contiguous streak. Each case has 1 to 10,000 entries and zero ends the input. If no contiguous segment has positive profit, print `Losing streak.` rather than a numeric zero.

## Building the approach

A negative accumulated prefix can only reduce the profit of every future segment attached to it, so it should be discarded. A still-positive accumulation may remain useful even after one loss.

Let `ending` be the best sum of a segment ending at the current position, allowing an empty segment so it never drops below zero. For each value, update `ending=max(0, ending+value)`. Keep `best` as the maximum `ending` seen anywhere.

This is Kadane's algorithm. It processes the stream directly and never needs to remember earlier values or enumerate all start and end pairs.

## Walkthrough

For `12,-4,-10,4,9`, ending values are 12, 8, 0, 4, and 13, so the best streak wins 13. For `5,-1,5`, preserving the small loss gives a total of 9, better than either isolated five.

For `-2,-1,-2`, ending and best remain zero. Since no positive streak exists, the required output is `Losing streak.` rather than the least-negative value.

## Why it works

Any nonempty segment ending at the current position either consists only of the current value or extends a segment ending one position earlier. If the previous best ending sum is positive, extending it is the best available prefix; if every such sum is negative, discarding them and starting fresh cannot be worse. Allowing empty sum zero combines these cases as `max(0,ending+value)`.

By induction, `ending` is correct at every position. Every contiguous segment has exactly one ending position, so taking the maximum over all ending states covers the global optimum. A final maximum of zero means precisely that no positive segment exists.

## Complexity

Each entry receives constant work, for `O(N)` time and `O(1)` extra space.

## Common mistakes

- Resetting after every negative value even when the accumulated sum remains positive.
- Adding all positive values without respecting contiguity.
- Printing only the final `ending` rather than the historical maximum.
- Printing a numeric zero for an all-losing case.
- Treating physical line breaks as separate games instead of reading exactly N values.
