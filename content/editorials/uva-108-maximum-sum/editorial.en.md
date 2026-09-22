# Compress each row band and run one-dimensional Kadane

## Problem and constraints

Find the maximum sum of a nonempty, contiguous, axis-aligned subrectangle in an `N*N` integer matrix. `N<=100`, entries range from -127 to 127, and a matrix may be entirely negative. This site reads multiple matrices terminated by `N=0` or EOF.

## Building the approach

Enumerating four boundaries and summing every cell repeatedly is too expensive. Fix the top and bottom rows. For each column, accumulate all values between those rows into `columns[c]`. Choosing a consecutive range of columns now corresponds exactly to one rectangle with the fixed vertical boundaries.

Run Kadane's algorithm on `columns`. Let `ending` be the largest nonempty subarray sum ending at the current column. It either starts at the current value or extends the previous best ending:

`ending=max(columns[c], ending+columns[c])`.

For each top row, begin column sums at zero and extend the bottom row downward, adding one row at a time. This avoids recomputing band sums.

Initialize from real values rather than zero so an empty rectangle is never selected.

## Walkthrough

If a row band compresses to `6,11,-10,1`, the maximum consecutive range is the first two columns with sum 17.

For `-5,-2`, Kadane returns -2. Returning zero would represent an illegal empty range. Likewise an all-negative matrix must choose its largest single cell.

## Why it works

Every nonempty rectangle has unique top and bottom rows and a consecutive interval of columns. The outer loops enumerate its vertical boundaries, and the corresponding interval in `columns` has exactly the same sum.

For one dimension, any optimal subarray ending at column c either consists only of c or appends c to an optimal ending at c-1. The recurrence chooses the better case, so by induction it finds the best range for each band. Taking the maximum across all bands therefore covers every possible rectangle.

## Complexity

There are `O(N^2)` row bands and each takes `O(N)` accumulation/Kadane work, for `O(N^3)` time. Matrix storage is `O(N^2)` and column storage `O(N)`.

## Common mistakes

- Initializing the answer to zero and allowing an empty rectangle.
- Forgetting to reset column sums for each new top row.
- Selecting arbitrary positive cells that do not form one rectangle.
- Enumerating four boundaries and resumming cells, causing excessive time.
