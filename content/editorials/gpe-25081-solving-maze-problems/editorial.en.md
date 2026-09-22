# Search first, then mark only the reconstructed maze path

## Problem and constraints

The input is one 10 by 10 maze with one `S`, one `G`, open cells `.`, and walls `#`. Movement is limited to four cardinal neighbors inside the grid. A solvable maze has one simple solution path; unsolvable mazes are permitted. On success, replace every cell of the solution path, including `S` and `G`, with `+`. On failure print `No solution`. Output ends with a blank line.

## Building the approach

Cells explored during a search are not necessarily part of the answer because search may enter dead ends. Keep exploration separate from drawing.

Run breadth-first search from `S`. For every newly reached cell `v`, store `parent[v]`, the cell from which it was first discovered. The parent array also serves as the visited marker, with the start pointing to itself. Do not change grid characters while searching.

If the goal has no parent after BFS, it is unreachable. Otherwise follow parents backward from `G` through `S`, replacing exactly those cells with `+`. The uniqueness guarantee means this discovered path is the required one.

## Walkthrough

When `S` and `G` are adjacent, both cells become `+`. If BFS explores a long dead end before finding another branch to the goal, those dead-end cells remain unchanged because they are not on the goal's parent chain.

If walls isolate the start from the goal, the program prints only the required failure sentence and blank line.

## Why it works

Every enqueued cell is reached from an already reachable cell by one legal move, so all marked cells are reachable. Conversely, induction along any legal start path shows BFS eventually discovers every reachable cell. Thus goal parent existence exactly characterizes solvability.

Each non-start parent is an adjacent cell discovered earlier, so following parents cannot cycle and must return to the start. This chain is a legal start-to-goal path. Only its cells are modified, and the unique-path promise ensures there is no alternative path that should be drawn instead.

## Complexity

For a general `R` by `C` grid, time and space are `O(RC)`. Here both are fixed at one hundred cells.

## Common mistakes

- Marking every visited cell and including dead ends.
- Leaving `S` and `G` unconverted.
- Moving across row boundaries without checking coordinates.
- Failing to mark the start visited before BFS.
- Following an unset goal parent when no solution exists.
