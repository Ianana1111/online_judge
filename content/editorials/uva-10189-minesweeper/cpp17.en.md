The input loop terminates only on `0 0` and allocates a grid sized to the current field. `field` controls both numbering and the separator preceding all but the first output.

A mine branch prints and continues, so only safe cells execute neighbor counting. Short-circuit `&&` evaluates all coordinate bounds before `grid[nr][nc]`, preventing invalid access. Counts range only from zero to eight and print as one character, followed by one newline per row.
