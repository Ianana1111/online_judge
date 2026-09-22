The first half of `hole` is sorted and the second adds the circumference, preserving global order. For each length, a pointer only moves forward because both starting positions and endpoints are monotone; `<=` includes the far endpoint.

For each `start`, `end=start+n` denotes exactly one revolution. `dp[end]=0`, and reverse iteration guarantees every jump state is already computed. `min(end,next)` ignores doubled holes beyond the required revolution. Reusing the array is safe because every state read in the current range is recomputed during that iteration.
