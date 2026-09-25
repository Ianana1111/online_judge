Look at the last step into any cell. Except on a boundary, it must come from either above or the left. Therefore, if `best[r][c]` is the minimum sum reaching the cell, then

`best[r][c] = value[r][c] + min(best[r-1][c], best[r][c-1])`.

The top-left state is its own value. The first row can only extend from the left, and the first column only from above. Row-major processing guarantees both predecessors are ready.

Only one row is necessary. Before updating `dp[c]`, it still holds the result from above; `dp[c-1]` has already been updated for the current row and represents the left predecessor. This also allows each matrix value to be consumed directly from input.

A cell is reached from above or left; in a one-row DP, the old value is above and the updated left neighbor is left.
