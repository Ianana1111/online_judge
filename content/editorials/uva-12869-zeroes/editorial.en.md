# Count factorial-zero plateaus instead of skipped values

## Problem and constraints

Let `f(n)` be the number of trailing decimal zeroes in `n!`. For a positive interval `[low,high]` with endpoints up to `9*10^18`, count how many distinct values of `f` actually occur. Up to 50,000 queries precede sentinel `0 0`; the interval cannot be enumerated.

## Building the approach

Moving from `(n-1)!` to `n!` changes the number of factors of five only when `n` is divisible by five. Therefore `f` is constant within each block identified by `floor(n/5)` and strictly increases between consecutive blocks. Multiples of 25 may skip several numeric values, but still begin only one new attained plateau.

The interval touches every block number from `floor(low/5)` through `floor(high/5)`, so the answer is `high/5-low/5+1`.

## Walkthrough

From 1 through 10, the function occupies three plateaus and the answer is three. From 24 through 25, it jumps from 4 to 6; only those two values occur, so the answer is two rather than three. From 5 through 9, both endpoints lie in one block and the answer is one.

## Why it works

If consecutive integers do not cross a multiple of five, the new factor contributes no five and the trailing-zero count stays fixed. At a multiple of five, at least one new five makes it strictly larger. Hence block numbers and attained plateau values are in one-to-one increasing correspondence. A continuous integer interval touches exactly the inclusive number of blocks given by the formula.

## Complexity

Each query uses constant time and space. Signed 64-bit integers exactly hold all endpoints and results.

## Common mistakes

- Using `f(high)-f(low)+1` and counting skipped values.
- Forgetting the initial block and returning zero within one plateau.
- Counting a jump at `low` twice through `low-1`.
- Storing 18-digit endpoints in floating point.
- Enumerating factorials or every integer in the interval.
