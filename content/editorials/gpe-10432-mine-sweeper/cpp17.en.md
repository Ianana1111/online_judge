`board` stores the mine positions and `touch` stores player actions; neither is overwritten while counting. The first nested loop computes `lost` from the conjunction of `'*'` and `'x'` at the same coordinates.

In the output loop, the mine-reveal branch comes before the untouched-cell branch. This is what reveals an untouched mine after a loss. Both branches use `continue`, so neighbor counting runs only for touched safe cells.

The offset loops range from −1 to 1. `if (dr || dc)` skips the center, and the four bounds comparisons occur before accessing `board[nr][nc]`. A newline ends each row; `if (tc)` adds a blank line before every case except the first. Numeric zero is sent to the output stream just like any other count.
