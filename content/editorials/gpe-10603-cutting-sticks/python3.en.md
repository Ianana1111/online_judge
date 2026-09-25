The same final pieces can have different costs depending on cut order. Cutting from left to right repeatedly charges for a large remaining piece. A greedy midpoint choice sounds plausible, but does not account for all later cuts.

Instead, ask which cut happens first within a particular segment. That cut costs the entire segment length. Afterward its left and right pieces are independent: cutting one cannot change the other's costs. This is the structure needed for interval dynamic programming.

Add 0 and L to the cut-position array. Let `dp[left][right]` be the minimum cost of completing all required cuts strictly between those two boundaries. Adjacent boundaries contain no required cut, so their cost is zero. For a larger interval, try every first cut k and minimize `cut[right] − cut[left] + dp[left][k] + dp[k][right]`. Fill shorter intervals before longer ones.

The state dp[left][right] is the minimum cost inside two boundaries. Try each possible first cut, then add the independently optimal costs of both sides.
