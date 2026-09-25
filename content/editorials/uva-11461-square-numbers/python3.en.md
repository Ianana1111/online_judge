Precompute every positive square at most 100000: these are `1²` through `316²`, since `317²` is too large. For each query, count the precomputed values in the inclusive interval `[a,b]`; an endpoint that is itself a square must count. There are only 316 candidates and at most 200 queries, so a direct scan is fast and avoids floating-point square-root rounding. Stop only at the `0 0` pair, without printing an answer for that sentinel.

The python3 program turns this reasoning into direct computation or lookup while preserving the required input and output format.
