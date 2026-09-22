# Fix row boundaries and scan consecutive clear columns

## Problem and constraints

In a binary matrix, zero is cleared land and one is a remaining tree. Find the largest axis-aligned rectangle containing only zeros and print its area. Both dimensions are from 1 through 100, and `0 0` terminates input. The result may be any rectangle, not necessarily a square, and separated clear cells cannot be joined.

## Building the approach

Enumerating all four rectangle boundaries is unnecessarily quartic. Fix a top row, then extend a bottom row downward. Maintain `clear[c]`, which is true exactly when every cell in column `c` from top through bottom is zero. On each new bottom row, update it with logical AND.

For fixed top and bottom, a valid rectangle is simply a consecutive run of true columns. Scan left to right: increment `current` on a clear column and reset it on a blocked column. Multiply the run length by the inclusive height and update the best area.

When choosing a new top row, reset all columns to true; while extending one top, preserve false values so a tree cannot disappear from the vertical interval.

## Walkthrough

For rows `0 0 1 0` and `0 0 0 0`, using both rows makes columns one, two, and four clear. The longest consecutive run is two, so the area is four; column four cannot be bridged across the blocked third column.

An all-zero matrix returns its full area, while an all-one matrix leaves the answer zero.

## Why it works

For fixed top, repeated AND updates make `clear[c]` true exactly when the entire current vertical interval in that column is zero. Therefore every valid rectangle for those row boundaries corresponds exactly to a consecutive true run, and every such run is a valid rectangle.

The scan finds the longest run for each pair of row boundaries. Since the outer loops enumerate every possible top and bottom, every all-zero rectangle is considered and the maximum area is found.

## Complexity

There are `O(R^2)` row pairs and each scans `C` columns, for `O(R^2 C)` time. Matrix storage is `O(RC)` and clear-column state `O(C)`.

## Common mistakes

- Treating ones as usable cells.
- Combining rows with OR instead of requiring every cell zero.
- Failing to reset a width at a blocked column.
- Clearing vertical state after every bottom row.
- Solving only for squares.
