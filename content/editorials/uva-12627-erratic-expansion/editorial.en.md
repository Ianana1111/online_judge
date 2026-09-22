# Count row prefixes through the expansion's three-copy recursion

## Problem and constraints

A red cell expands into a 2-by-2 block whose top-left, top-right, and bottom-left cells are red and whose bottom-right cell is blue; blue produces only blue. After `K<=30` expansions, count red cells in inclusive rows `A` through `B` of the `2^K` square without constructing it.

## Building the approach

Level `K` consists of three copies of level `K-1` in the top-left, top-right, and bottom-left quadrants, plus an all-blue bottom-right quadrant. A complete level has `3^K` red cells.

Define `prefix(K,r)` as red cells in the first `r` rows. With half-height `h=2^(K-1)`, if `r<=h`, the two top copies contribute `2*prefix(K-1,r)`. Otherwise the complete top half contributes `2*3^(K-1)` and the remaining rows contribute `prefix(K-1,r-h)` from the bottom-left copy. The interval answer is `prefix(K,B)-prefix(K,A-1)`.

## Walkthrough

At level one, the two row counts are two and one. The full level-three grid contains `3^3=27` red cells. At level zero, the sole row contains one, while a zero-row prefix must return zero before that base case.

## Why it works

The three-copy quadrant structure follows directly by induction from the cell rule. Each prefix either takes matching prefixes from both top copies, or the disjoint complete top half plus a prefix of the only red bottom copy. Thus the recurrence counts every selected cell exactly once. Induction proves all prefixes, and prefix subtraction leaves precisely rows A through B.

## Complexity

After `O(30)` power preprocessing, each prefix takes `O(K)` time and recursion space. Counts use 64-bit integers because `3^30` exceeds 32 bits.

## Common mistakes

- Counting only one top quadrant.
- Treating the bottom-right quadrant as another red copy.
- Subtracting `prefix(A)` instead of `prefix(A-1)`.
- Using 32-bit result storage.
- Returning one for a zero-row prefix at level zero.
