# Propagate path counts upward through the acyclic board

## Problem and constraints

One white checker moves toward the first row on an `N x N` board with fixed black pieces. It may step one cell diagonally upward into an empty cell. If that adjacent cell contains black, it may instead jump one more cell in the same direction, provided the landing cell is in bounds and empty. Count paths reaching the top row modulo 1,000,007.

## Building the approach

Every move decreases the row by one or two, so states form a DAG. Let `ways[r][c]` count paths from the start to that cell. Initialize the white square to one and process rows bottom to top.

For each direction, inspect the adjacent diagonal. If it is outside, no move exists. If empty, move one step. If black, shift once more in the same direction and accept only an in-bounds nonblack landing. Add current ways to the destination modulo the required value. Do not extend top-row states; sum them as mutually exclusive destinations. A white checker already on top contributes its zero-move path.

## Walkthrough

On a 3-by-3 board with white at the lower-left, black at center, and empty upper-right, the checker jumps over black and has one route. If upper-right is also black, the landing is occupied and no route exists. A one-cell board returns one.

## Why it works

All edges lead to smaller rows, making bottom-to-top order topological. When a state is processed, every predecessor contribution is complete. Each path to a destination is uniquely its previous path plus its last legal move, so addition counts all paths without duplication. The two direction transitions implement exactly step-or-jump rules and validate obstacles and landing cells. Summing disjoint top cells yields all successful routes.

## Complexity

Each cell examines two directions, for `O(N^2)` time and `O(N^2)` space.

## Common mistakes

- Using modulus 1,000,000,007 instead of 1,000,007.
- Jumping two cells without an adjacent black piece.
- Failing to verify the jump landing cell.
- Processing rows in an order before predecessors are complete.
- Returning zero when the start already lies on the top row.
