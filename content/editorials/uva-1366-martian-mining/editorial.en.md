# Optimize the staircase boundary using row and column prefix profits

## Problem and constraints

Each grid cell contains west-bound yeyenum and north-bound bloggium, but holds only one straight conveyor. Material must travel directly to its matching factory without turning or crossing the other belt type. For grids up to 500 by 500, maximize transported mineral; `0 0` terminates input.

## Building the approach

Effective west belts form a prefix of each row, and effective north belts form a prefix of each column. An exchange argument yields an optimum separated by a monotone staircase.

Let `dp[i][j]` be the best for the first i rows and j columns. The last staircase step either adds the entire west-profit prefix of row i to `dp[i-1][j]`, or the entire north-profit prefix of column j to `dp[i][j-1]`. Thus take their maximum. Precompute row-west and column-north prefixes; update a one-dimensional DP left to right.

## Walkthrough

With one cell, choose the larger mineral but never both. If a north belt occupies the left part of a row, a west belt to its right cannot reach the western factory through it, showing why cellwise maximum is invalid.

## Why it works

Invalid west belts blocked by an earlier north belt can be changed to north without losing transported west mineral; a symmetric cleanup across rows produces a monotone staircase optimum. At its lower-right boundary, either the bottom row contributes a complete west prefix or the right column a complete north prefix. Removing that step leaves the corresponding subproblem, and both extensions are legal. Induction proves the recurrence optimum.

## Complexity

Prefix construction and DP take `O(nm)` time. Prefix tables use `O(nm)` space and compressed DP `O(m)`; totals use 64 bits.

## Common mistakes

- Taking the larger mineral independently in each cell.
- Accumulating west vertically or north horizontally.
- Allowing belts to turn.
- Adding only the lower-right cell rather than a prefix.
- Updating one-dimensional DP in the wrong direction.
