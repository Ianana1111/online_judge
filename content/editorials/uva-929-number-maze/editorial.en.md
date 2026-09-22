# Run Dijkstra with the destination cell as each move's cost

## Problem and constraints

An `N x M` grid, with dimensions up to 999, assigns each cell cost 0 through 9. Move up, down, left, or right from the upper-left to lower-right and minimize the sum of every visited cell, including both endpoints. Paths may move in all four directions; a detour can avoid expensive cells.

## Building the approach

Treat cells as vertices. Moving into a neighboring cell has edge cost equal to that destination cell's value. Initialize the source distance to its own cell cost, then every relaxation adds only the next cell. All weights are nonnegative, so use min-heap Dijkstra.

Push a new heap entry only for a strict improvement. Because old entries remain in the heap, skip one whose cost differs from the current distance. When the destination is popped with its current value, that value is final and search may stop. A flat index `row*M+col` stores nearly one million cells compactly, but coordinates must be restored and bounds checked before producing neighbor indices.

## Walkthrough

A one-cell grid of cost 7 has answer 7, not zero. A single row `0,1,2,3,4,5` costs 15. In a larger grid, a cheap channel may require initially moving away from the destination; right-and-down-only dynamic programming would miss it.

## Why it works

Initial source cost plus each destination-cell edge exactly equals the sum of cells on a grid path, and every graph edge is one legal orthogonal move. Thus graph paths and maze walks correspond with equal cost. Dijkstra settles minimum distances under nonnegative weights, including zero edges. Strict relaxation prevents equal-cost zero cycles from reentering indefinitely, and the settled destination is therefore the required minimum.

## Complexity

For `V=NM` and at most `4V` edges, heap Dijkstra takes `O(V log V)` time and `O(V)` space.

## Common mistakes

- Initializing the source to zero and omitting its cost.
- Considering only right and down moves.
- Using unweighted BFS.
- Enqueuing non-strict equal distances around zero-cost cycles.
- Adding one to a flat index without checking column boundaries.
