Let `a` be the shorter side and `b` the longer. If `a=0`, answer zero. If `a=1`, no knight move fits, so every cell may be occupied.

If `a=2`, the optimal pattern repeats every four columns: fill two consecutive columns completely, then leave two empty. Each full block contributes four knights. A remaining one column contributes two; two or three columns contribute four. This is

`4*(b/4) + min(4, 2*(b%4))`.

When both dimensions are at least three, color the board like a chessboard. Knights always move between colors, so filling the larger color class constructs `ceil(MN/2)` nonattacking knights; the pairing argument in the verified Chinese proof supplies a matching upper bound, making this value optimal.

The calculation may normalize side lengths, but output must keep the original row and column order.
