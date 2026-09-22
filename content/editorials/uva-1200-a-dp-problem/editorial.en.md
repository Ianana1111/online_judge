# Parse both affine expressions, then floor the exact rational solution

## Problem and constraints

Each case is a parenthesis-free linear equation in `x`, with constants, numeric multiples of `x`, or implicit `x`, joined by plus and minus. Explicit unary operators are absent. Print the floor of a unique solution, `IMPOSSIBLE` for none, or `IDENTITY` for infinitely many.

## Building the approach

Parse each side into `coefficient*x + constant`. For each term, read its sign and decimal digits. If followed by `x`, add to the coefficient; otherwise add to the constant. An `x` with no digits has coefficient 1, while explicit `0x` has coefficient zero, so track whether digits occurred.

For `ax+b=cx+d`, move terms to obtain `(a-c)x=d-b`. If the coefficient is zero, a zero right side is an identity and a nonzero one impossible. Otherwise keep numerator and denominator as integers, make the denominator positive, and divide. C++ truncates negative fractions toward zero; when numerator is negative and has a nonzero remainder, decrement the quotient to obtain mathematical floor.

## Walkthrough

`2x+1=0` has solution `-1/2`, whose floor is -1 rather than C++ quotient zero. `x+2=2+x` becomes `0x=0` and is `IDENTITY`; `0x=1` is `IMPOSSIBLE`. An exact negative integer needs no extra decrement.

## Why it works

The parser assigns every term to coefficient or constant with its exact sign, so each affine result equals its source expression for all `x`. Algebraic rearrangement preserves the solution set. Zero coefficient produces precisely the identity/no-solution split. For a nonzero coefficient, the rational ratio is the unique solution. With positive denominator, truncation already equals floor for nonnegative or exact values, and differs by exactly one only for a negative nonintegral numerator; the correction covers that case.

## Complexity

An equation of length `L` is scanned once in `O(L)` time and `O(1)` extra state beyond its strings.

## Common mistakes

- Using truncation rather than floor for negative fractions.
- Treating explicit `0x` as implicit `x`.
- Dividing by zero before distinguishing identity and impossibility.
- Using floating point and truncating.
- Reversing a coefficient or constant sign during rearrangement.
