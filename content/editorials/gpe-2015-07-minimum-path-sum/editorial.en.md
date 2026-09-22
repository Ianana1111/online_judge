# Compute the minimum path sum with one DP row

## Problem and constraints

Given a matrix of nonnegative integers, move from the top-left cell to the bottom-right cell using only right and down steps. Minimize the sum of all visited values, including both endpoints. The archived statement does not provide complete size and value bounds, so the implementation uses dynamically sized storage and 64-bit path sums.

## Building the approach

Look at the last step into any cell. Except on a boundary, it must come from either above or the left. Therefore, if `best[r][c]` is the minimum sum reaching the cell, then

`best[r][c] = value[r][c] + min(best[r-1][c], best[r][c-1])`.

The top-left state is its own value. The first row can only extend from the left, and the first column only from above. Row-major processing guarantees both predecessors are ready.

Only one row is necessary. Before updating `dp[c]`, it still holds the result from above; `dp[c-1]` has already been updated for the current row and represents the left predecessor. This also allows each matrix value to be consumed directly from input.

## Walkthrough

For rows `1 3 1`, `1 5 1`, and `4 2 1`, the DP rows become `1 4 5`, then `2 7 6`, then `6 8 7`. The bottom-right answer is 7.

One optimal path visits `1,3,1,1,1`. Choosing the locally smaller neighboring value greedily is not a proof of optimality because later costs may reverse that choice.

## Why it works

Induct in row-major order. The start has exactly one zero-step path and the correct cost. Boundary cells have only one legal predecessor, so their accumulated costs are correct.

For an interior cell, every legal path ends from above or left. By induction, both stored predecessor costs are minimal. Taking their minimum and adding the current value is no larger than any legal route and is itself achieved by extending a valid predecessor path. Thus every state is correct, including the destination.

## Complexity

Every cell is read and updated once, for `O(rows*cols)` time. The DP array uses `O(cols)` extra space, and the matrix is not stored.

## Common mistakes

- Omitting the starting cell's value.
- Considering only one predecessor.
- Updating the one-dimensional array from right to left.
- Giving an invalid boundary predecessor cost zero.
- Reusing DP state across test cases.
