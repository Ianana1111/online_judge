# Raise the decimal coefficient exactly and restore the total scale

## Problem and constraints

Compute the exact decimal value of `R^n`, where finite decimal `R` occupies at most six input columns, `0 < R < 99.999`, and `1 <= n <= 25`. Remove unnecessary leading zeros and fractional trailing zeros. Results below one begin with the decimal point rather than `0.`, while meaningful trailing zeros in an integer such as 100 must remain.

## Building the approach

If `R` has `d` fractional digits, remove its point to obtain integer `A`. Exactly,

`R = A / 10^d`, so `R^n = A^n / 10^(dn)`.

Compute `A^n` with arbitrary-precision integer arithmetic. Convert it to decimal text, pad on the left if necessary, and insert the point `dn` digits from the right. Only when a fractional point was inserted, strip zeroes from the fractional end and then a now-terminal point. Finally remove leading zeroes, leaving `.01` rather than `0.01`.

Never pass through binary floating point or a limited Decimal precision: information lost there cannot be recovered by formatting.

## Walkthrough

`1.0100` becomes coefficient 10100 with scale four. Squaring gives 102010000 at scale eight, written `1.02010000` and normalized to `1.0201`. `0.1000^2` becomes `.01`. `10.000^2` becomes integer `100`; those two integer zeros are meaningful and must not be stripped.

## Why it works

Removing the decimal point is the exact identity `A/10^d`; exponentiation yields the exact integer numerator and scale `dn`. Arbitrary-precision power introduces no rounding, and point placement performs exact division by that power of ten. Removing only leading representation zeros and fractional trailing zeros preserves numerical value while enforcing the requested canonical form. Integer trailing zeros never enter the fractional cleanup branch.

## Complexity

The result has `O(nL)` decimal digits for input length `L`. Formatting uses `O(nL)` time and space, while exponentiation uses the language's big-integer algorithms with `O(log n)` large multiplications.

## Common mistakes

- Computing with `float` and losing exact digits.
- Restoring only `d` fractional positions instead of `d*n`.
- Keeping a leading zero before a subunit result.
- Stripping all trailing zeros and turning 100 into 1.
- Leaving a terminal decimal point after normalization.
