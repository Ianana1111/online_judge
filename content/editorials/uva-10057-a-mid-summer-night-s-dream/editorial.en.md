# The median interval contains every minimum absolute-deviation answer

## Problem and constraints

Given up to one million nonnegative integers below 65,536, choose an integer `A` minimizing the sum of absolute differences. Output three values: the smallest optimal A; how many input occurrences themselves lie among optimal values, counting duplicates; and how many distinct integer A values are optimal, whether or not they occur in the input. The second value is not merely the frequency of the smallest optimum.

## Building the approach

Sort the data. Let `low=values[(N-1)/2]` be the lower median and `high=values[N/2]` the upper median. Every integer in the closed interval `[low,high]` minimizes total absolute deviation, and no value outside it does.

The first output is therefore `low`. The number of distinct integer choices is `high-low+1`. To count input occurrences that are optimal, count all sorted elements within the complete interval using `upper_bound(high)-lower_bound(low)`.

For odd N the two medians coincide. For even N both endpoints and all integers between them are optimal, so duplicates at both ends contribute to the second field.

## Walkthrough

For values 0 and 10, every A from 0 through 10 has total distance ten. Output is `0 2 11`: both input occurrences are optimal values and there are eleven integer choices.

For `1,1,9,9`, output is `1 4 9`. For `1,2,2,4`, both medians are two, so output is `2 2 1`.

## Why it works

Pair sorted extremes `x<=y`. Their combined distance is at least `y-x`, with equality exactly when A lies in `[x,y]`. Intersecting these equality intervals over all pairs leaves precisely the interval between the two middle elements. With odd N, the unpaired middle element additionally forces the same singleton median.

Thus `[low,high]` is exactly the full optimum set. Its lower endpoint, count of original occurrences within it, and inclusive number of integers give the three required outputs.

## Complexity

Sorting takes `O(N log N)` time, two binary searches take `O(log N)`, and input storage is `O(N)`.

## Common mistakes

- Counting only occurrences of the lower median for even N.
- Deduplicating input occurrences in the second field.
- Counting only candidate values that appear in the input.
- Using the arithmetic mean instead of medians.
- Forgetting the inclusive `+1` in interval size.
