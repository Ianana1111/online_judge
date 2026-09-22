# Trace one complete ring before generalizing

## Problem and constraints

Hexagonal cells are numbered in expanding rings around cell 1. For each positive label below 100,000, print its coordinates in the axes shown in the statement. These are not ordinary square-grid coordinates: cell 1 is `(0,0)`, cell 2 is `(0,1)`, cell 3 is `(−1,1)`, and cell 7 is `(1,0)`.

## Building the approach

A direct formula must handle six sides and several boundary offsets. The input limit is small enough to avoid that complication: generate all labels in order once, then answer by lookup.

The useful invariant is the last position of the previous ring. Before ring r starts, it is `(r−1,0)`. Move once by `(0,1)` to the first cell of the new ring. Then follow the six directions `(-1,+1), (-1,0), (0,-1), (+1,-1), (+1,0), (0,+1)`.

The first direction takes only r − 1 further steps because the initial step already entered the ring. Every other direction takes r steps. The total is `1 + (r−1) + 5r = 6r`, and the walk ends at `(r,0)`, ready for the next ring. Save a coordinate whenever a step receives a new label.

## Walkthrough

Ring one starts at cell 2 `(0,1)`. Its first segment has zero further steps. The next five steps produce `(−1,1)`, `(−1,0)`, `(0,−1)`, `(1,−1)`, and `(1,0)`, ending at cell 7. Ring two starts with cell 8 at `(1,1)`; only the next step reaches cell 9 at `(0,2)`. Confusing those two positions shifts a whole ring.

## Why it works

The six direction segments follow the ring's boundary in the specified numbering order and visit its 6r cells without repetition. The ending coordinate establishes the same invariant for the next ring. Starting from the center, induction therefore assigns every generated label its correct coordinate, and lookup returns that assignment directly.

## Complexity

O(U) preprocessing time and space for U = 99,999, then O(1) per query. The last ring may be traversed completely, but coordinates beyond the table limit are not written.

## Common mistakes

- Using a square spiral or reversing the diagram's orientation.
- Swapping the coordinate axes.
- Walking r additional steps on the first side after entering the ring.
- Numbering the center as zero.
- Writing beyond the table during the final partial ring.
