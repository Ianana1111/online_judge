Define `prefix(n)` as the number of one bits among all integers from zero through `n`, with `prefix(n)=0` for negative `n`. The query answer is `prefix(b)-prefix(a-1)`.

For a bit of value `p`, consecutive integers repeat a cycle of `p` zeroes followed by `p` ones. Among the `n+1` integers in a prefix, each full cycle contributes `p` ones. If the remaining length is `r`, it contributes `max(0,r-p)` additional ones. Sum this formula for `p=1,2,4,...` while `p<=n`.

Each bit follows a repeated zero block and one block. Count complete periods plus the final partial period, then subtract two prefix totals. Use a 64-bit result.
