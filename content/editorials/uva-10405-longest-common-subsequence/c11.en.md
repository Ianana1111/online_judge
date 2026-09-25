Let `dp[i][j]` be the LCS length of the first `i` characters of `a` and the first `j` characters of `b`. Examine the final characters of these prefixes.

If they match, an optimal common subsequence can pair them at the end, giving `dp[i-1][j-1]+1`. If they differ, they cannot both be the same final matched character, so at least one is unused; the answer is `max(dp[i-1][j], dp[i][j-1])`.

Each row depends only on the previous row and the already computed cell to its left. Keep arrays named `previous` and `current` instead of the full table. Fill a complete row from left to right, then swap them.

Use `getline` so spaces and empty strings remain part of their correct cases.

Compare the final characters of two prefixes. A match extends the shorter-prefix LCS; otherwise discard one ending. Read complete lines to preserve spaces and empty strings.
