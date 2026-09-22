# Count new triangles by their unique largest side

## Problem and constraints

Choose three different rods from lengths 1 through `n` and count unordered triples that form a nondegenerate triangle. After sorting sides as `a<b<c`, the strict condition is `a+b>c`; equality is invalid. Queries reach one million, and any input below 3 terminates the program.

## Building the approach

Classify every triangle by its unique largest side `c`. For fixed second side `b`, the smallest side must satisfy both `c-b<a` and `a<b`, giving `max(0, 2b-c-1)` integer choices.

Summing this over `b` simplifies, according to the parity of `c`, to `floor((c-2)^2/4)`. Therefore

`triangles[n] = triangles[n-1] + floor((n-2)^2/4)`.

Precompute this prefix table through one million and answer each query by lookup. Promote before squaring so the multiplication itself occurs in 64 bits.

## Walkthrough

For `n=3`, the only triple 1,2,3 is degenerate, so the answer is zero. Adding rod 4 creates `(2,3,4)`, giving one. Adding rod 5 creates `(2,4,5)` and `(3,4,5)`, bringing the total to three.

## Why it works

Every valid triple has one unique largest side, so classification by `c` is complete and disjoint. For fixed `b,c`, valid integers `a` run from `c-b+1` through `b-1`, exactly `2b-c-1` choices when positive. For `c=2k` these positive counts sum as `1+3+...+(2k-3)=(k-1)^2`; for `c=2k+1` they sum as `2+4+...+(2k-2)=k(k-1)`. Both equal `floor((c-2)^2/4)`. Adding this exact count for every largest side proves the prefix recurrence.

## Complexity

Precomputation takes `O(U)` time and `O(U)` space for `U=10^6`. Every query is answered in `O(1)`. Results require 64-bit integers.

## Common mistakes

- Counting `a+b=c` as a triangle.
- Allowing equal side lengths despite having one rod of each length.
- Squaring in 32-bit arithmetic before assigning to `long long`.
- Enumerating triples for each million-size query.
- Giving `n=3` a nonzero base value.
