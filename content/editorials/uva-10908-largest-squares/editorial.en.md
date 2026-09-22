# Expand centered squares one complete border at a time

## Problem and constraints

For each zero-based grid coordinate `(r,c)`, find the largest odd-sided square centered there whose every character equals the center character. The square must remain inside an `M` by `N` grid, with dimensions at most 100. Print the original `M N Q` header before each case's answers.

## Building the approach

Radius zero, a 1-by-1 square, is always valid. A radius-k square spans rows `r-k..r+k` and columns `c-k..c+k`, with side `2k+1`.

When radius k-1 is already valid, expanding adds only the top, bottom, left, and right border lines. Check every character on these four sides against the center. If all match, accept the new radius; on the first mismatch, stop because every larger square includes that cell.

The maximum possible radius is the minimum distance from the center to the four grid boundaries. Computing it first keeps every border index valid.

## Walkthrough

If center `(1,2)` contains `b` and all cells in rows 0 through 2 and columns 1 through 3 are `b`, radius one succeeds and side length is three. If the center is only one row from the top, no larger radius fits.

If radius one's border contains any different character, the answer stays one. A center on the outer grid boundary also has only radius zero.

## Why it works

The radius-zero base is valid. Assuming radius k-1 is valid, the four checked sides are exactly the cells added by radius k, so the new square is valid if and only if all those cells match.

After a failed border, every larger centered square contains the same mismatch. Beyond the geometric limit, a square is out of bounds. Therefore the last accepted radius is exactly the maximum valid one, and converting it to `2r+1` gives the side length.

## Complexity

For maximum radius R, border checks total `O(R^2)` per query. Grid storage is `O(MN)` and query working space is `O(1)`.

## Common mistakes

- Printing the radius instead of odd side length.
- Checking only corners or a central cross.
- Treating the coordinate as a top-left corner or as one-based.
- Mixing row and column dimensions on rectangular grids.
- Omitting the case's `M N Q` heading.
