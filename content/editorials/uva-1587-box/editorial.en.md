# Normalize six rectangles and verify opposite pairs share three box edges

## Problem and constraints

Each case gives six rectangular boards with rotatable sides. Decide whether they are exactly the six faces of one rectangular box, printing `POSSIBLE` or `IMPOSSIBLE`. Cases continue to EOF, and box dimensions may be equal, including a cube.

## Building the approach

Normalize every board as `(shortSide,longSide)` and sort the six pairs. For box edges `x<=y<=z`, the sorted faces must be two copies each of `(x,y)`, `(x,z)`, and `(y,z)`.

First require equality in sorted pairs 0-1, 2-3, and 4-5. Then verify their representative dimensions share one consistent x, y, and z. Three unrelated equal pairs alone are insufficient.

## Walkthrough

A 2-by-3-by-5 box needs two boards each of 2x3, 2x5, and 3x5; rotation and input order do not matter. Replacing one 3x5 by 3x6 breaks a pair. Six 4x4 boards pass because equal box edges are legal.

## Why it works

Necessity follows because opposite faces are equal and every box face pairs two of its three edges. After normalization and sorting they have exactly the stated arrangement. Conversely, pair equality plus the three compatibility equations defines consistent edges x,y,z and gives exactly two of each required face, which can form that box. Equal dimensions do not invalidate either direction.

## Complexity

Sorting and comparing six fixed pairs use `O(1)` time and space.

## Common mistakes

- Failing to normalize rotated rectangles.
- Checking only three equal pairs.
- Requiring all three face types to differ.
- Comparing only total areas.
- Treating the first number as a case count.
