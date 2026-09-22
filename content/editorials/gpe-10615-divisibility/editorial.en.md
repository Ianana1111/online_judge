# Replace huge lattice values with a no-carry digit condition

## Problem and constraints

At a nonnegative N-dimensional lattice point, the value is the sum of the values at neighbors obtained by decreasing one coordinate. The origin has value one and negative-coordinate positions have value zero. Count points in a supplied coordinate box whose values are not divisible by prime P, modulo 1,000,000,009.

There are at most seven dimensions and 50 cases. P is one of 2, 3, 5, 7, 11, 13, 17, or 19; coordinates have at most 15 decimal digits. Enumerating the box or calculating its enormous values is infeasible.

## Building the approach

First identify what the recurrence counts. To reach `(X₁,...,Xₙ)` from the origin, take S = ΣXᵢ steps and choose which steps use each direction. The lattice value is the multinomial coefficient `S! / (X₁! ... Xₙ!)`.

We only need divisibility by P. The exponent of P in t! is `(t − sₚ(t))/(P−1)`, where sₚ is the base-P digit sum. Substituting into the coefficient gives `[Σsₚ(Xᵢ) − sₚ(S)]/(P−1)`. Each carry decreases digit sum by a positive multiple of P − 1. Consequently, the value is not divisible by P exactly when adding all coordinates in base P produces **no carry in any column**. Every column's digit sum must be less than P.

Now count digit choices instead of lattice values. Process base-P digits from most significant to least. For each coordinate, remember whether its chosen prefix still equals the lower-bound prefix and whether it still equals the upper-bound prefix. A strict departure releases that side's restriction for all remaining digits.

Within one column, process coordinates one at a time and track their partial digit sum, keeping only sums below P. For one coordinate, digits leading to the same next bound flags form at most three contiguous ranges. For a range [lo, hi], the number of ways to reach sum s is the sum of old counts from s − hi through s − lo. A sliding window computes all these transitions in O(P), avoiding a second digit loop.

After all coordinates are processed, discard the column sum: it has already been checked, and no carry can affect the next column. Preserve only the bound flags and continue.

## Walkthrough

Take two coordinates, both in [0,1], and P = 2. The four lattice values are 1, 1, 1, and 2. Only `(1,1)` has a binary-column sum of two, so exactly three points qualify. With P = 3, that sum is below the base, so all four qualify. The origin always qualifies because its value is one.

## Why it works

The path count satisfies the same recurrence and boundary values as the lattice definition. The factorial exponent identity then proves divisibility is equivalent to the presence of a base-P carry. Bound flags retain precisely the prefix information needed to enforce each coordinate interval. The within-column transitions enumerate all legal digit choices and reject exactly those creating a carry. Sliding-window summation groups those same choices without changing their count. Every coordinate tuple has one digit expansion and one DP path, so the final sum counts each qualifying point once.

## Complexity

With D ≤ 50 base-P digits, at most 3ᴺ flag combinations are active. Transitions take O(D N 3ᴺ P) time. This implementation allocates directly indexed 4ᴺ buffers and clears them, adding O(D N 4ᴺ P) work. Space is O(4ᴺ P), plus the digit arrays. Coordinates fit in `long long`; all counts are maintained modulo the required modulus.

## Common mistakes

- Testing divisibility of the coordinate sum instead of the multinomial value.
- Checking only the lowest digit.
- Ignoring nonzero lower bounds.
- Accepting a column sum equal to P.
- Multiplying interval lengths without the no-carry restriction.
- Excluding the origin.
