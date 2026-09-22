# Search denominations without skipping the first unreachable postage

## Problem and constraints

Choose K distinct positive denominations and use at most H stamps to maximize R such that every postage from 1 through R is representable. `H+K<=9`; `0 0` ends input. This platform prints only maximum consecutive coverage, not the denominations.

## Building the approach

Denominations are strictly increasing and the first must be one. If current choices cover 1 through C, the next denomination need not exceed C+1: anything larger cannot fill the first gap, while C+1 improves coverage. DFS therefore tries values from `last+1` through `C+1`.

At each node, `dp[v]` is the minimum stamps needed for v, capped by H+1. Copy the table, extend through `H*d`, and update upward with `dp[v]=min(dp[v],dp[v-d]+1)` so the new denomination may repeat. The first value requiring more than H ends consecutive coverage. A safe recursively applied `H*(C+1)` upper bound prunes branches, and repeated `(H,K)` queries are cached.

## Walkthrough

For H=3,K=2, denomination one initially covers through 3, so the second choice is only 2,3,or4. Choices 1,4 cover through 6, while 1,3 cover through 7, which is optimal. Reaching an isolated larger postage does not repair an earlier gap.

## Why it works

Any denomination above C+1 leaves C+1 unreachable forever because later denominations are larger; replacing it by C+1 cannot reduce current coverage, so some optimum lies inside the search. Upward complete-knapsack updates compute exact minimum stamp counts with repeated use. Scanning to the first value above H therefore gives exact coverage. The pruning bound never underestimates future maximum value, so no improving leaf is lost.

## Complexity

This is bounded exponential search, not polynomial in K. For S visited nodes, each node costs proportional to its `H*d` table; `H+K<=9` keeps it finite and small. Recursion stores one table per depth.

## Common mistakes

- Maximizing any reachable value rather than gap-free coverage.
- Omitting candidate C+1.
- Updating downward and allowing each denomination only once.
- Requiring exactly H stamps rather than at most H.
- Printing denominations for a different problem version.
