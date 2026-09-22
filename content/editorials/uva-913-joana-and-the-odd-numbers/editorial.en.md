# Locate the row's final odd number through the sum of odd row lengths

## Problem and constraints

Rows contain 1, 3, 5, and so on consecutive positive odd numbers. Given the odd number `N` of elements in one row, compute the sum of that row's last three values. Here `1 < N < 10^9`, so at least three values exist, input continues to EOF, and results fit signed 64-bit range.

## Building the approach

Row `r` has `2r-1` elements, so `r=(N+1)/2`. The first `r` rows contain

`1+3+...+(2r-1)=r^2`

values. The `k`-th positive odd number is `2k-1`, making this row's final value `last=2r^2-1`. The preceding two odd values are `last-2` and `last-4`, so their sum is `3*last-6`, equivalently `6r^2-9`.

All arithmetic must be 64-bit from before multiplication; generating rows is impossible near the upper limit.

## Walkthrough

For `N=3`, `r=2` and row values are 3,5,7, summing to 15. For `N=5`, `r=3`, the ninth odd number is 17, and `13+15+17=45`. With `N=55`, `r=28`, final value is 1567 and the sum is 4695.

## Why it works

The identity for the first `r` odd numbers follows from `r^2-(r-1)^2=2r-1`, so the row ends at global position `r^2`. Consecutive global values are consecutive odd numbers, hence the last is `2r^2-1` and the prior two differ by two each. Summing these exact three values proves the formula, and `N>=3` keeps them within the same row.

## Complexity

Each query takes `O(1)` time and `O(1)` space.

## Common mistakes

- Treating row length `N` as row number.
- Squaring in 32-bit arithmetic before conversion.
- Treating consecutive odd values as differing by one.
- Enumerating rows up to an input near one billion.
