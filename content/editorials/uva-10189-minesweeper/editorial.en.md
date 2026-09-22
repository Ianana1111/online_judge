# Count all eight neighboring mines with boundary checks

## Problem and constraints

For each minefield of 1 through 100 rows and columns, `*` marks a mine and `.` a safe cell. Replace every safe cell with the number of mines among its eight surrounding positions while preserving mines. `0 0` terminates input. Each output uses `Field #x:` and exactly one blank line separates consecutive fields.

## Building the approach

Keep the original grid unchanged. Scan each cell. A mine prints `*` immediately. For a safe cell, enumerate row and column offsets from -1 through 1, excluding `(0,0)`, which leaves exactly the eight possible neighbors.

For each candidate coordinate, first check it lies inside the grid, then inspect whether it contains a mine and increment. Calculating from the original board ensures numbers emitted earlier never become input for later cells.

Track the field number both for headings and to print a separator before every field except the first.

## Walkthrough

In a 3 by 3 board with only the center mined, output rows are `111`, `1*1`, and `111`. Every safe cell neighbors the center.

An all-safe board prints zeros. For a one-cell board, a safe cell is zero and a mine remains `*`; all surrounding offsets are outside and ignored.

## Why it works

The offset set `{−1,0,1}^2` minus `(0,0)` corresponds one-to-one with the eight neighboring positions. Bounds checks remove exactly nonexistent positions.

Every increment therefore corresponds to one legal neighboring mine, and every neighboring mine appears in exactly one offset. Mines follow their direct output branch, so every output cell matches the definition.

## Complexity

Each cell checks eight constant neighbors, giving `O(RC)` time. Grid storage is `O(RC)` and other working space constant.

## Common mistakes

- Checking only four orthogonal neighbors.
- Accessing the grid before checking bounds.
- Excluding valid row or column zero.
- Printing an extra blank line before the first field or none between fields.
