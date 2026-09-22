# Exclude the borders, then compare both coordinates

## Problem and constraints

Horizontal and vertical lines through a division point `(N,M)` split the plane into four regions. For each residence, print `divisa` if it lies on either line; otherwise print `NO`, `NE`, `SE`, or `SO`. Each dataset has up to 1,000 queries, and a zero query count terminates input. West is represented by Portuguese `O`, not `W`.

## Building the approach

First test `x==N || y==M`. Equality in either coordinate puts the residence on a border and outside every quadrant. After excluding borders, compare `y` with `M` to choose north `N` or south `S`, then compare `x` with `N` to choose east `E` or west `O`.

All comparisons are relative to the dataset's division point rather than the origin. No translation, distances, or floating-point arithmetic are needed.

## Walkthrough

With center `(2,1)`, residence `(10,10)` is northeast and prints `NE`; `(0,33)` is northwest and prints `NO`. Point `(-10,1)` has a different x-coordinate but lies on the horizontal border, so it prints `divisa`. The center itself also prints that word once.

## Why it works

Any point with equal x or equal y is exactly on one of the two defining lines. For every remaining point, each coordinate is strictly greater or strictly smaller than its center coordinate. The two independent binary choices form four mutually exclusive and exhaustive combinations, and the generated north/south plus east/west letters are precisely their required names.

## Complexity

Each query uses `O(1)` time and `O(1)` extra space; a dataset takes `O(K)` time.

## Common mistakes

- Using logical AND for the border test and recognizing only the center.
- Comparing coordinates with zero instead of the division point.
- Printing `W` instead of required `O`.
- Swapping the roles of x and y.
- Classifying a quadrant before testing equality.
