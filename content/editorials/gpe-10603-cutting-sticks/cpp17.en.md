`cut` has N + 2 entries, including the original stick ends. The zero-initialized DP table already handles adjacent boundaries and the no-cut case.

`gap` is the difference between boundary indices, not the physical segment length. Starting it at two skips intervals with no internal cut. For each larger interval, `INT_MAX` prepares a minimum over all `first` indices strictly between the boundaries.

The physical cost is always `cut[right] - cut[left]`. Both subinterval index gaps are smaller than the current gap, so their table entries are ready. `dp[0][n + 1]` finally covers the entire original stick and is printed in the required sentence.
