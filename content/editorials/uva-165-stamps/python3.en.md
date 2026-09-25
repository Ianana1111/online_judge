Denominations are strictly increasing and the first must be one. If current choices cover 1 through C, the next denomination need not exceed C+1: anything larger cannot fill the first gap, while C+1 improves coverage. DFS therefore tries values from `last+1` through `C+1`.

At each node, `dp[v]` is the minimum stamps needed for v, capped by H+1. Copy the table, extend through `H*d`, and update upward with `dp[v]=min(dp[v],dp[v-d]+1)` so the new denomination may repeat. The first value requiring more than H ends consecutive coverage. A safe recursively applied `H*(C+1)` upper bound prunes branches, and repeated `(H,K)` queries are cached.

If coverage currently reaches C, the next denomination only needs to lie above the previous one and at most C+1. Recompute minimum stamps and contiguous coverage after adding it; prune branches whose theoretical upper bound cannot beat the best result.
