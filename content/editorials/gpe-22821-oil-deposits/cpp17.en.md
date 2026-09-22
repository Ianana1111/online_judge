An `@` cell simultaneously means oil and unvisited, eliminating a separate visited array. Both the initial cell and every neighbor are changed to `*` before entering the stack.

`row,column` name the current cell and `nr,nc` a candidate neighbor. Bounds are verified before indexing. The nested offsets include all four diagonals and skip only the current cell. `answer` increases only when the outer scan begins a new traversal, so component area does not affect its count.
