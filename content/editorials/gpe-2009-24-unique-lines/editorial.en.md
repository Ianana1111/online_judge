# Normalize integer line equations to remove duplicates

## Problem and constraints

Given fewer than 100 distinct integer-coordinate points, every pair determines an infinite line. Count how many distinct lines occur. Many pairs formed by three or more collinear points must count only once. The statement gives no smaller coordinate bound, so coordinates are read as signed 64-bit values and coefficients are computed in 128-bit integers to protect subtraction and products.

## Building the approach

Deduplication requires a canonical representation. Slope alone loses the line's position, merges parallel lines, and needs a special vertical case. Instead represent every line as the integer equation `a*x + b*y + c = 0`.

For points `(x,y)` and `(u,v)`, choose `a=v-y`, `b=x-u`, and `c=-(a*x+b*y)`. Normalize this triple by dividing all coefficients by `gcd(|a|,|b|,|c|)`. There is still a sign ambiguity, so make `a` positive, or when `a=0`, make `b` positive.

Insert every normalized triple into a set. Equal geometric lines now produce equal keys, while parallel lines retain different `c` values.

## Walkthrough

For `(0,0)`, `(1,1)`, and `(2,2)`, all three point pairs reduce to `x-y=0`. The set therefore contains one line.

Adding `(0,1)` and `(1,2)` creates `x-y+1=0`. Its direction matches the first line, but its normalized constant differs, so it remains a separate set entry.

## Why it works

For every pair of distinct points, `(a,b)` is nonzero and the computed `c` makes both points satisfy the equation, so every candidate line is represented. Integer coefficient triples describing the same line are proportional. Dividing by their common gcd leaves only a possible factor of `-1`, and the sign rule removes that final ambiguity.

Thus any two pairs on the same line map to the same canonical triple. Conversely, identical triples state the same equation and therefore the same line. The set retains exactly one key per distinct line.

## Complexity

Let `P=N(N-1)/2` and let `C` bound coefficient magnitude. Pair enumeration with gcd work and set insertion takes `O(N^2(log C + log N))` fixed-width integer operations. The set uses `O(N^2)` space.

## Common mistakes

- Deduplicating by slope and merging distinct parallel lines.
- Comparing floating-point slopes or intercepts exactly.
- Forgetting to divide coefficients by their gcd.
- Leaving both `(a,b,c)` and `(-a,-b,-c)` as different keys.
- Performing coordinate products in 32-bit or 64-bit arithmetic before widening.
