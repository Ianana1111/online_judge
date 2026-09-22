Input length is immediately converted to exclusive `end`, and the parallel `ends` array matches sorted ads. `upper_bound` is restricted to the already processed `i-1` entries and returns the compatible prefix length directly.

`best` has one extra zero entry because indices represent counts of considered ads. Each update compares skipping with adding current profit to `best[compatible]`. Results use 64-bit DP and exact case formatting.
