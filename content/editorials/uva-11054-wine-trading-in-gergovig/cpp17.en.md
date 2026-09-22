`balance` is the signed prefix demand. Each value is added before `llabs(balance)` contributes the flow across the boundary to its right.

The last house has no following edge, but the guaranteed zero total means its added term is zero, avoiding a special branch. Taking the absolute value only for `work` preserves the signed balance for later cancellation.

Both accumulators are `long long` and reset for every data set; only `n=0` terminates input.
