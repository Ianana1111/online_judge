# Locate the antidiagonal with triangular numbers, then follow its direction

## Problem and constraints

The Cantor sequence visits positive numerator/denominator grid points along alternating antidiagonals: 1/1,1/2,2/1,3/1,... Given term index up to ten million, print `TERM n IS a/b`. Fractions remain unreduced and queries continue to EOF.

## Building the approach

Diagonal d contains d entries whose numerator plus denominator is d+1. The first d diagonals contain triangular number `T(d)=d(d+1)/2`. Binary-search the smallest d with `T(d)>=n`.

The one-based offset is `n-T(d-1)`. On even diagonals numerator increases from one to d, so it equals offset. On odd diagonals it decreases, so use `d+1-offset`. Denominator is the fixed sum minus numerator.

## Walkthrough

For n=5, diagonal three contains it with offset two, giving 2/2, which must not reduce to 1/1. Term 7 starts diagonal four at 1/4, while term 10 ends it at 4/1.

## Why it works

Triangular cumulative counts uniquely locate n in the first diagonal whose endpoint reaches it. Subtracting earlier diagonals gives its exact position from one through d. Alternating parity formulas match the prescribed zigzag direction, and the fixed diagonal sum determines the other coordinate, yielding precisely the indexed grid entry.

## Complexity

Binary search takes `O(log n)` time and `O(1)` space, using 64-bit triangular arithmetic.

## Common mistakes

- Searching for `T(d)>n` and misplacing endpoints.
- Making offset zero-based accidentally.
- Reversing diagonal parity.
- Reducing fractions.
- Trusting an uncorrected floating-point square root.
