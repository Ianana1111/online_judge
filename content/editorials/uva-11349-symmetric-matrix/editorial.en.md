# Flatten the matrix and compare it with its reverse

## Problem and constraints

A square matrix is symmetric under this problem's definition only when every value is nonnegative and a 180-degree rotation leaves the matrix unchanged. This is central symmetry, not transpose symmetry. There are up to 300 cases, `1<=n<=100`, and entries range inclusively from `-2^32` to `2^32`, so signed 64-bit storage is required. The dimension header is formatted `N = n`.

## Building the approach

Under a 180-degree rotation, cell `(r,c)` corresponds to `(n-1-r,n-1-c)`. If the matrix is flattened row by row, index `i=r*n+c` corresponds exactly to `n*n-1-i`. The geometric test therefore becomes a comparison between the flat array and its reverse.

While reading, mark the case invalid if any value is negative. After all values are consumed, compare every value with its reverse partner. Even if a failure is found early, continue reading the complete case so the next header remains aligned.

## Walkthrough

The matrix rows `5 1 3`, `2 0 2`, and `3 1 5` flatten to `5,1,3,2,0,2,3,1,5`, which equals its reverse and contains no negative value, so it is symmetric.

Changing the lower-left 3 to 0 breaks the pair with the upper-right 3. A one-cell matrix containing `-1` matches itself under rotation but still fails the separate nonnegative requirement.

## Why it works

For flat index `i=r*n+c`, the reverse index is

`n^2-1-i = (n-1-r)*n + (n-1-c)`,

which is precisely the cell reached by rotating `(r,c)` 180 degrees. Thus all reverse-pair equalities hold exactly when the matrix has central symmetry. The reading pass independently verifies that every entry is nonnegative. The result stays true only when both necessary and sufficient conditions hold.

## Complexity

Reading and comparing each of the `n^2` entries takes `O(n^2)` time. The flattened matrix uses `O(n^2)` space.

## Common mistakes

- Comparing `(r,c)` with `(c,r)` and checking transpose symmetry.
- Forgetting the nonnegative-value requirement.
- Reading `2^32` into a signed 32-bit integer.
- Stopping input consumption immediately after detecting failure.
- Misreading the `N = n` header or omitting the final period in the output.
