# Enumerate square roots instead of every formatted number

## Problem and constraints

For an even-width decimal string, split it into equal left and right halves. It is quirksome when the square of the two half-values' sum equals the original number. Input widths are 2, 4, 6, or 8. Print every match in increasing numeric order with leading zeros. Repeated width queries must repeat their outputs.

## Building the approach

Scanning all eight-digit numbers would require one hundred million checks, but every answer must already be a square. Let `b=10^(digits/2)`. Any allowed numeric value `x` satisfies `0<=x<b^2`, with halves `x/b` and `x%b`.

Enumerate its nonnegative square root `r` from zero through `b-1`, set `x=r^2`, and test whether `x/b + x%b == r`. There are only 10,000 roots at the largest width. Since nonnegative squares increase with their roots, results are automatically ordered.

Numeric calculations do not retain leading zeros, so format every accepted value with exactly `digits` positions and zero fill.

## Walkthrough

For width four, `3025` splits into 30 and 25; their sum is 55 and `55^2=3025`. Both `0001` and `0000` also qualify and must retain their zeros.

For width two, the complete output is `00`, `01`, and `81`. A second width-two query prints those lines again.

## Why it works

If `x` is valid, its nonnegative root equals the sum of its halves. Since `x<b^2`, that root is below `b`, so enumeration reaches it. Conversely, the program prints only when `x=r^2` and the two halves sum to `r`, which is exactly the defining property.

Distinct nonnegative roots have distinct squares, so no result is duplicated within a query. Increasing roots yield increasing values, and zero padding changes only representation.

## Complexity

Each query takes `O(10^(digits/2))` time plus output and `O(1)` extra space.

## Common mistakes

- Starting roots at one and omitting all zeros.
- Losing required leading zeros.
- Including root `b`, whose square has too many digits.
- Splitting the two halves at different widths.
- Deduplicating repeated input queries.
