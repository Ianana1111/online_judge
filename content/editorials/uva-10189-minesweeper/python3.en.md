Keep the original grid unchanged. Scan each cell. A mine prints `*` immediately. For a safe cell, enumerate row and column offsets from -1 through 1, excluding `(0,0)`, which leaves exactly the eight possible neighbors.

For each candidate coordinate, first check it lies inside the grid, then inspect whether it contains a mine and increment. Calculating from the original board ensures numbers emitted earlier never become input for later cells.

Track the field number both for headings and to print a separator before every field except the first.

For each safe cell, inspect eight neighbors; check bounds before reading each neighbor.
