# Propagate each square's orientation in three dimensions

## Problem and constraints

Each case is a six-by-six binary grid containing exactly six marked unit squares. Decide whether folding along shared edges can make a cube. Print `correct` or `incorrect`, with a blank line between cases. Rotating, reflecting, or translating the paper layout must not affect the result.

## Building the approach

Connectivity alone is not enough. Six squares in a straight strip are connected, but eventually fold onto faces already occupied. Rather than memorizing every valid net in every orientation, track what face each square would become.

Give each square a three-dimensional frame `(u, v, n)`: its paper-right direction, paper-down direction, and outward normal. Start one square with the three coordinate axes. Crossing a shared edge folds the frame by 90 degrees. The right neighbor receives `(-n, v, u)`, the left `(n, v, -u)`, the lower `(u, -n, v)`, and the upper `(u, n, -v)`.

Use BFS to propagate these frames through paper neighbors. For an unseen square, save its predicted frame. For an already seen square, compare the complete frame with the new prediction; different routes must agree. Finally require all six squares to be reached and all six normals to be distinct. The only possible normals are the positive and negative coordinate axes, precisely the six cube faces.

## Walkthrough

Along a straight strip, four folds in the same direction return to the original face orientation, so six squares cannot occupy six different faces. A valid cross-shaped net reaches all six normals. A two-by-three rectangle also fails: going around a paper adjacency loop can predict conflicting frames for the same square.

## Why it works

Each frame transformation represents the required right-angle fold across the shared edge. Thus any valid cube folding must obey every propagated frame, and neither a conflict nor a repeated face is allowed. Conversely, consistent frames let connected squares be placed along their shared cube edges. Reaching all six with six different normals assigns one square to each cube face without overlap. These conditions are therefore necessary and sufficient.

## Complexity

The board is fixed-size, so time and space are constant. More generally, processing K squares and their local adjacency relations takes O(K) work.

## Common mistakes

- Checking only connectivity.
- Storing just the normal and losing the in-plane directions needed for later folds.
- Using the same rotation for opposite directions.
- Ignoring consistency when reaching a visited square.
- Matching only one orientation of a valid net.
