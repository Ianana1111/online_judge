# Count right-and-up paths with a one-row obstacle DP

## Problem and constraints

Little Red Riding Hood travels from `(0,0)` to `(w,h)`, moving only right or up and never through an intersection where a wolf may appear. Width and height are at most 100, with up to 100 blocked coordinates; the two homes are unblocked. Print one of three exact sentences for zero, one, or multiple paths. Input ends at `0 0`.

## Building the approach

For an unblocked point `(x,y)`, every path ends by arriving from `(x-1,y)` or `(x,y-1)`, two disjoint possibilities. Thus its count is the sum of left and below counts. A blocked point has zero paths, and the starting point begins with one empty path.

Compress rows into `ways[x]`. Before updating a cell, `ways[x]` is the count from below; after the preceding x was updated, `ways[x-1]` is the count from the left. Set a blocked cell to zero or add the left value otherwise.

Use exact integers. The statement bounds the final answer but intermediate regions may contain a much larger count before obstacles block them.

## Walkthrough

On a 1-by-1 grid with no wolf, right-then-up and up-then-right give two paths. Blocking `(0,1)` leaves one. Blocking both `(0,1)` and `(1,0)` prevents leaving the start and gives zero.

The grid contains `(w+1)(h+1)` intersection points, so both endpoint coordinates must be included.

## Why it works

The start has exactly one empty path. By induction on `x+y`, a blocked point correctly has none. At an open point, removing the final step bijects paths with the disjoint union of paths to its left and lower predecessors, so addition is exact.

The scan order keeps those two predecessor counts in the one-row array, making compression equivalent to the full recurrence. The final count therefore covers all and only legal paths, and its value selects the proper sentence.

## Complexity

There are `O(wh)` grid points. Time is `O(wh)` expected with set lookups, and space is `O(w+B)` for one row and B blocked coordinates.

## Common mistakes

- Treating w and h as point counts and omitting the far boundary.
- Leaving an old count at a blocked point.
- Applying a 32-bit modulus because only the final result is bounded.
- Using the plural sentence for exactly one path.
- Changing the required ASCII apostrophes or wording.
