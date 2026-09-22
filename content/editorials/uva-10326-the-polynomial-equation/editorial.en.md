# Multiply one linear factor for every root, then format the expansion

## Problem and constraints

Given one through fifty integer roots, print the monic polynomial equation having exactly those roots with their supplied multiplicities. Roots may repeat and may be zero or negative. Final coefficients have magnitude at most `10^15`. Terms with a zero coefficient are omitted except that a zero constant must still appear as `+ 0`; coefficient magnitude one is omitted on nonconstant terms, and `x^1` is written simply as `x`.

## Building the approach

A root `r` contributes the factor `(x-r)`. Start from the constant polynomial one and multiply in one such factor for every input root, including duplicates. Store coefficients from low power to high power: `coefficients[i]` is the coefficient of `x^i`.

When an old term `c_i*x^i` is multiplied by `(x-r)`, it contributes `-r*c_i` to degree `i` and `c_i` to degree `i+1`. Add those two contributions to a fresh array. A fresh array is important because an in-place forward update could read coefficients already modified for the current factor.

After expansion, walk from the highest degree down. Handle signs separately from term magnitudes, omit a numeric one before `x`, use `x` rather than `x^1`, skip zero nonconstant terms, and always emit the constant even when it is zero. Python integers keep all intermediate arithmetic exact.

## Walkthrough

Roots two and three produce `(x-2)(x-3)=x^2-5x+6`, printed as `x^2 - 5x + 6 = 0`.

Roots zero, one, and negative one produce `x(x-1)(x+1)=x^3-x`. The required output is `x^3 - x + 0 = 0`: the zero quadratic term disappears, while the zero constant remains. Repeated roots one and one produce `x^2-2x+1`; deduplicating the roots would incorrectly lower the degree.

## Why it works

Initially, the coefficient array represents the empty product, one. Assume that after processing `k` roots it represents the product of their `k` linear factors. Distributing the next factor `(x-r)` over every old term creates exactly the two contributions stored at degrees `i` and `i+1`. Summing them produces the exact product with the next factor. By induction, the final array represents all supplied roots with their multiplicities and remains monic.

Formatting changes only how coefficients are written: it omits algebraically redundant zero terms and unit magnitudes according to the specification while preserving the constant term. Therefore the displayed equation represents the constructed polynomial exactly.

## Complexity

The `k`th factor processes `O(k)` coefficients, for `O(N^2)` exact integer operations overall. The coefficient array uses `O(N)` integers; actual arithmetic cost also depends on their bit lengths.

## Common mistakes

- Multiplying by `(x+r)` and reversing every root's sign.
- Updating coefficients forward in place and reusing changed values.
- Removing duplicate roots.
- Omitting the mandatory zero constant.
- Printing `1x`, `x^1`, or extra multiplication symbols.
- Building strings before the coefficients are fully known.
