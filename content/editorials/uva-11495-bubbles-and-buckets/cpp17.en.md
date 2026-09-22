The Fenwick tree stores frequencies of previously read permutation values. `query(x)` counts previous values at most `x`; because values are distinct, subtracting it from `i` gives exactly the previous values greater than `x`.

`moves` uses `long long`, while individual tree counts fit in `int`. Queries move toward zero by removing the lowest set bit, and updates move through covering ranges by adding it. Values already occupy ranks 1 through `N`, so coordinate compression is unnecessary.
