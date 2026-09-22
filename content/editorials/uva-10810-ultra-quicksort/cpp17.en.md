The sorted copy exists only for coordinate compression; the original scan order remains in `a`. Adding one to the lower-bound index gives Fenwick's required one-based ranks.

The `prefix` lambda walks downward by the lowest set bit and sums frequencies through the current rank. Before insertion, `i` is exactly the number of earlier elements, so `i-prefix(rank)` counts the larger ones.

Individual tree counts fit in `int`, but their sum uses `long long`. Performing the wide accumulation from the start avoids overflow before output conversion.
