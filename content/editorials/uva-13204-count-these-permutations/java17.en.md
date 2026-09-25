Across the cut after position `k`, let `c_k` left positions receive right-side values. Conservation gives the same number crossing backward, so total displacement is `2*sum c_k`. Each cut has capacity `min(k,n-k)`; reaching the global maximum forces every cut to saturate.

For `n=2m`, saturation means the first half contains all larger values and the second all smaller values. Each half may be permuted freely, giving `(m!)^2`. For `n=2m+1`, separating whether middle value `m+1` lies at the center, left, or right gives `(m!)^2 + m(m!)^2 + m(m!)^2 = n(m!)^2`. Precompute factorials through the largest `floor(n/2)`.

Maximum-displacement permutations split into freely permuted halves, giving ((n/2)!)² for even n. Odd n has an additional factor n for the central choice. Precompute factorials once for all queries.
