# Keep only reachable remainders after each sign choice

## Problem and constraints

Given up to 10,000 integers, place either plus or minus between adjacent values and decide whether some resulting expression is divisible by `K`, where `2<=K<=100`. The first number retains its original sign; choices apply only before later numbers. Inputs may be negative. Only existence is required, not the actual signs.

## Building the approach

Divisibility depends only on remainder modulo `K`. Two partial sums with the same remainder have identical possibilities after every future addition or subtraction, so at most `K` states need to survive each step.

Let `possible[r]` mean that some sign choices for the processed prefix produce remainder `r`. Initialize it with the normalized remainder of the first number. For every later value, create a fresh empty `next` and, from each reachable `r`, mark both `(r+value) mod K` and `(r-value) mod K`.

Normalize negative inputs into `0..K-1`. A fresh next array is essential: carrying old states would allow skipping the current value, while in-place updates could reuse it multiple times.

## Walkthrough

For `1,2,3` with `K=4`, the initial remainder is one. After two, only remainder three is reachable. Adding or subtracting three then reaches two or zero, so the expression is divisible; `1+2-3=0` is one witness.

When `N=1`, there is no sign choice and the sole number's remainder directly decides the answer.

## Why it works

Assume `possible` exactly represents all remainders of the first `i` numbers. The next number must be added or subtracted, so every legal new expression follows one of the two recorded transitions. Conversely, each recorded transition appends a legal sign to an existing expression.

Thus the fresh next set is exact by induction. After all numbers, remainder zero is present exactly when some complete expression is divisible by `K`.

## Complexity

Each of `N` values scans at most `K` states, giving `O(NK)` time and `O(K)` rolling-state space, plus stored input in this implementation.

## Common mistakes

- Using negative remainders as array indices.
- Trying only all-plus or all-minus expressions.
- Copying old states into `next` and allowing a number to be skipped.
- Updating in place and applying one number repeatedly.
- Tracking unbounded actual sums instead of remainders.
