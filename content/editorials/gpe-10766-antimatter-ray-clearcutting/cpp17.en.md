Each tree corresponds to one mask bit. The `same` mask includes all trees at one coordinate. Point pairs with identical positions are skipped because they do not define a direction; distinct pairs generate a full collinear mask using `x*dy == y*dx` in `long long`.

`unique` deduplicates masks before the DP. The table starts at an unreachable value of `n + 1`, except `dp[0] = 0`. A mask already containing enough trees updates `answer` and needs no further shots. A state whose cost cannot improve the current answer is also skipped.

For every useful line, bitwise OR adds newly removed trees. If the mask changes, its value increases, so the later table entry is updated before its ascending-order turn. `__builtin_popcount` checks the number of distinct removed trees, including coincident trees as separate input objects.
