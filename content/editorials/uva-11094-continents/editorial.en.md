# Remove the king's continent, then measure every remaining component

## Problem and constraints

The map has at most 20 rows and 20 columns and uses at most two characters. The king starts on land, so the character at the starting cell determines which character means land. Land cells connect in four directions. The left and right edges wrap around, while the top and bottom edges do not. After excluding the king's entire continent, we need the size of the largest remaining continent of the same land type.

## Building the approach

The task is naturally split into two uses of the same flood fill. First, start from the king and mark every cell in the king's connected component; ignore the returned size. Then scan the map. Whenever an unvisited cell has the land character, flood from it, count that whole component, and compare its size with the answer.

Rows and columns require different boundary rules. A row outside `[0, M)` is invalid. A neighboring column is normalized with `(column + delta + N) % N`, which joins the horizontal edges and also avoids a negative C++ remainder when moving left from column zero.

## Walkthrough

In `xyx / yyy / xyy`, starting from the top-left `x`, the two `x` cells on the first row are connected across the horizontal seam. Both belong to the king and are removed. The final-row `x` is a separate continent of size 1.

In `xxx / yyy / xxx`, the first and last rows do not connect vertically. Starting on the first row leaves the last row as another continent of size 3. If the entire map is one land component, no candidate remains and the answer is 0.

## Why it works

A flood fill follows exactly the allowed four-direction moves, including horizontal wrapping, and enters only cells with the chosen land character. It therefore visits all and only the cells in one continent. The first flood marks the complete king's continent, so the later scan can never count it. Every other continent is discovered from its first unvisited cell and is then marked completely, so it is counted exactly once. The maximum of those component sizes is precisely the requested answer.

## Complexity

Every map cell is visited at most once and each visit checks four neighbors. The time complexity is `O(MN)`, and the grid, visited matrix, and queue require `O(MN)` space.

## Common mistakes

- Hard-coding a particular character as land instead of reading the starting cell.
- Excluding only the king's single cell rather than the whole starting component.
- Forgetting horizontal wrapping or incorrectly wrapping vertically too.
- Using a negative remainder as an array index when moving left.
- Treating diagonal cells as connected.
