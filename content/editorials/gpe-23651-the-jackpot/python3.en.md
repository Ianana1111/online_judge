A negative accumulated prefix can only reduce the profit of every future segment attached to it, so it should be discarded. A still-positive accumulation may remain useful even after one loss.

Let `ending` be the best sum of a segment ending at the current position, allowing an empty segment so it never drops below zero. For each value, update `ending=max(0, ending+value)`. Keep `best` as the maximum `ending` seen anywhere.

This is Kadane's algorithm. It processes the stream directly and never needs to remember earlier values or enumerate all start and end pairs.

`best` keeps the largest nonnegative subarray sum; only a positive value counts as a winning streak.
