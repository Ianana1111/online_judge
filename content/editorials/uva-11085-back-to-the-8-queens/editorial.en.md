# Compare the board with every legal eight-queens arrangement

## Problem and constraints

There is exactly one queen in each of the eight columns. An input gives the row of each queen, and one move changes a queen's row while keeping its column. Moving one row or seven rows costs the same: one move. We need the minimum number of queens that must be moved so that no two queens share a row or diagonal.

## Building the approach

Searching through sequences of moves is unnecessary because the cost depends only on the final row chosen in each column. Instead, ask which legal eight-queens board will be the final board.

Generate every legal target once with backtracking. Process columns from left to right and try each row. Three bit masks record occupied rows, `row + column` diagonals, and `row - column` diagonals. A placement that conflicts with any mask is skipped. When all eight columns are filled, save the board.

For a fixed legal target, a queen costs zero moves if its row already matches and exactly one move otherwise. Thus the cost is the Hamming distance between the input and target arrays. The minimum across all generated targets is the answer.

## Walkthrough

If all eight input queens are in row 1, any legal target can keep at most the queen whose target row is 1. The other seven queens must move, so the answer is 7. If the input is already one of the legal targets, all eight positions match and the answer is 0. Changing one row of a legal board produces a board that can be restored in one move, regardless of the vertical distance.

## Why it works

The backtracking chooses one row for every column and rejects exactly the row and diagonal conflicts, so every saved board is legal. Conversely, following the row choices of any legal board never triggers a rejection, so every legal target is generated.

For one target, every mismatching column must be changed at least once, while moving each mismatching queen directly to its target row achieves the target with exactly that many moves. Therefore the computed distance is the optimal cost for that target. Taking the minimum over the complete set of legal targets gives the global optimum.

## Complexity

The fixed-size backtracking is bounded by `O(8!)` candidate row permutations and produces 92 legal boards. Each test case compares 92 boards across 8 columns, so its work is `O(92 * 8)` and effectively constant. The stored target boards also use constant space.

## Common mistakes

- Charging the absolute row distance instead of one move per relocated queen.
- Checking rows but forgetting one or both diagonal directions.
- Allowing queens to change columns.
- Comparing with only one legal target rather than all 92.
- Rebuilding the same target set for every input case.
