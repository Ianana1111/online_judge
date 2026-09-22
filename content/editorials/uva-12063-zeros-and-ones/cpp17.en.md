Odd length and zero divisor are rejected before `half` and `1%k` initialization. The one-count dimension stops at `half`, and appending one checks that bound.

Each `length` iteration creates a zeroed `next` table and transfers both possible final bits, then swaps layers. The final answer reads only `dp[half][0]`. Unsigned 64-bit counters cover the maximum binomial count.
