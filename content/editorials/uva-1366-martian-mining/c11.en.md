Effective west belts form a prefix of each row, and effective north belts form a prefix of each column. An exchange argument yields an optimum separated by a monotone staircase.

Let `dp[i][j]` be the best for the first i rows and j columns. The last staircase step either adds the entire west-profit prefix of row i to `dp[i-1][j]`, or the entire north-profit prefix of column j to `dp[i][j-1]`. Thus take their maximum. Precompute row-west and column-north prefixes; update a one-dimensional DP left to right.

Westbound and northbound belts define a monotone separating staircase. Precompute westbound row prefixes and northbound column prefixes, then choose at each DP cell between extending from above with a row prefix or from left with a column prefix.
