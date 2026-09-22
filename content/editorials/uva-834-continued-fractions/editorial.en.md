# Collect floor-division quotients from the Euclidean algorithm

## Problem and constraints

Expand each rational numerator over nonzero denominator as the unique finite continued fraction `[b0;b1,...,bn]`, with positive later coefficients and final coefficient above one when a fractional tail exists. Input continues to EOF and integers have no fixed magnitude bound. This platform allows signed rationals, normalizes denominator sign, and prints an integral value as `[b0;]` including the semicolon.

## Building the approach

Make the denominator positive. Floor-divide `a` by `b` to obtain `a = q*b+r` with `0 <= r < b`. The quotient `q` is the next coefficient. If `r=0`, expansion ends. Otherwise

`a/b = q + 1/(b/r)`,

so continue with pair `(b,r)`. These are exactly the quotients of the Euclidean algorithm.

Floor division matters for a negative rational. Truncating `-43/19` toward zero would choose -2 and leave a negative tail; floor gives -3 with a valid positive fractional remainder. Python `divmod` with positive denominator supplies the required quotient and nonnegative remainder exactly.

## Walkthrough

Euclidean equations for `43/19` give quotients 2,3,1,4, producing `[2;3,1,4]`. `5/1` divides immediately and prints `[5;]`. For `-43/19`, the first step is `-3 + 14/19`, leading to `[-3;1,2,1,4]` with all later coefficients positive.

## Why it works

Every division preserves the exact identity `a/b = q + 1/(b/r)` until a zero remainder leaves the integer `q`. Reconstructing from the last coefficient therefore returns the original rational. Positive denominator and Euclidean remainders make later quotients positive and strictly decrease remainders, guaranteeing termination. The final exact division has quotient at least two whenever a fractional tail exists, satisfying canonical uniqueness.

## Complexity

The Euclidean algorithm takes `O(log |b|)` iterations and stores that many coefficients, with arbitrary-precision integer division cost determined by operand bit lengths.

## Common mistakes

- Truncating negative quotients toward zero.
- Leaving a negative denominator unnormalized.
- Continuing after a zero remainder.
- Splitting the final coefficient into a noncanonical trailing one.
- Omitting the semicolon for an integer result.
