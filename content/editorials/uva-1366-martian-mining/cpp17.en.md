`west` accumulates within each row and `north` within each column, with zero borders representing empty rectangles. Each value is the full straight-path profit to its factory.

During left-to-right row updates, old `dp[j]` still represents the previous row, while updated `dp[j-1]` represents the current row's left subproblem. They are exactly the two recurrence sources. Overwriting the maximum removes the need for a full DP matrix, and `dp[m]` is the complete-grid optimum.
