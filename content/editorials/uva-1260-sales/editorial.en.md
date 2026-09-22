# Count earlier sales with a dynamic frequency prefix sum

## Problem and constraints

For each day's sales, count how many earlier days had sales less than or equal to today's amount, then sum those counts. A sequence has 2 through 1,000 values in the range 1 through 5,000. Equal amounts count, while the current day does not.

## Building the approach

Scan in chronological order and maintain frequencies of values already seen in a Fenwick tree. For current value `x`, the prefix query through `x` is exactly the number of earlier values no greater than `x`. Add it to the answer, then insert today's value.

Keeping duplicate frequencies makes every earlier equal day count separately. Querying before updating excludes the current day without a special case.

## Walkthrough

For `20,43,57,43,20`, daily contributions are `0,1,2,2,1`, totaling 6. For three values all equal to 5, the contributions are `0,1,2`; a strict-less query would incorrectly return zero.

## Why it works

Before day `i`, the tree frequency at each value equals its occurrences among precisely the earlier days. A prefix through `x` sums exactly those frequencies satisfying value `<=x`. Inserting the current value afterward restores the invariant for the next day. Every qualifying ordered day pair is counted once when its later endpoint is processed.

## Complexity

Each query and update costs `O(log 5000)`, for `O(N log 5000)` time and `O(5000)` space.

## Common mistakes

- Querying `x-1` and excluding equal sales.
- Updating before querying and counting the current day.
- Counting earlier larger values instead.
- Sorting the sequence and destroying chronology.
