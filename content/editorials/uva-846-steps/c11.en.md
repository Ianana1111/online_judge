For a fixed step count, maximum distance forms a mountain rising from one toward the center and falling to one. With `2k-1` steps, its maximum is

`1+2+...+k+...+2+1 = k^2`.

With `2k` steps, duplicating the peak gives maximum `k(k+1)`. Let `k=floor(sqrt(d))` for `d=y-x`. If `d=k^2`, answer `2k-1`; if `k^2 < d <= k^2+k`, answer `2k`; otherwise answer `2k+1`. Handle zero first.

Obtain a square-root estimate and correct it using integer squares so values exactly at boundaries cannot be misclassified by floating rounding.

The move count changes at k², k²+k, and (k+1)²; correct the integer square root at boundaries.
