# The tallest common tower is a longest common subsequence

## Problem and constraints

Two towers list tile radii from top to bottom, with 1 through 100 tiles each. Tiles may be removed, but the order of retained tiles cannot change. Find the maximum number of levels that can remain so both towers become identical. Radii may repeat. Two zero lengths terminate input, and each result uses the specified case heading and blank line.

## Building the approach

Deleting while preserving order is exactly the longest common subsequence problem. Let `dp[i][j]` be the maximum common length using the first `i` tiles of tower A and first `j` tiles of tower B.

If the last radii match, pair them after an optimal solution for the shorter prefixes: `dp[i-1][j-1]+1`. If they differ, a common subsequence cannot use both as one matching final pair, so discard either A's last tile or B's last tile and take `max(dp[i-1][j],dp[i][j-1])`.

An extra zero row and column represent an empty tower. Counting radius multiplicities alone is insufficient because it ignores order; resetting on mismatch would solve a contiguous-substring problem instead.

## Walkthrough

For A=`1,2,3,2` and B=`2,1,2,3`, the common sequence `1,2,3` has length three. Although both multisets suggest more shared radii, no reordering can retain all four.

For A=`1,2,3` and B=`1,3`, removing the middle 2 retains two levels even though the match is not contiguous.

## Why it works

Empty-prefix states are zero. For matching final values, there exists an optimal common subsequence using that pair; removing it leaves an optimal subproblem and contributes one. For unequal final values, any common subsequence omits at least one of those two last tiles and is therefore covered by one of the two smaller prefix states.

These cases are exhaustive, and every transition constructs a legal common subsequence. Filling the table from smaller prefixes proves `dp[n][m]` is the maximum possible tower height.

## Complexity

Time and space are `O(NM)`, at most about ten thousand states. No parent pointers are needed because only length is requested.

## Common mistakes

- Sorting radii and destroying tower order.
- Resetting mismatches to zero and requiring contiguity.
- Adding one from an edge state that reuses a tile.
- Omitting the zero boundary row and column.
- Misformatting the headings or blank line.
