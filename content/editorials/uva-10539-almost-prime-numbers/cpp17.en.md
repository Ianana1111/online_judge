The sieve includes all possible bases through one million. `1LL*p*p` promotes multiplication before squaring, then `value` remains a 64-bit integer while higher powers are generated.

`limit` is `10^12-1`, matching the strict query upper bound. Before `value *= p`, the division check proves whether the next power would exceed that limit and also prevents signed overflow.

The powers are sorted only once. Each answer subtracts the iterator returned for the first value at least `low` from the iterator for the first value greater than `high`; this difference counts elements rather than subtracting their numerical values.
