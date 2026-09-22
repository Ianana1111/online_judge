Tower values use `long long`, while DP entries store only lengths and fit `int`. Allocating `(n+1)*(m+1)` zero-initialized cells provides the empty-prefix boundaries without branches.

Loops begin at one, so sequence indices are one less. Matching radii read the upper-left cell and consume one tile from each tower; mismatches take the maximum of top and left. `dp[n][m]` corresponds to both full sequences and is printed with the exact two-line case format plus a blank line.
