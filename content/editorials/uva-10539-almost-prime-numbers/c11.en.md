Unique prime factorization turns the definition into a precise form: a number with only prime factor `p` must be `p^k`. Since the number itself must not be prime, `k>=2`. Conversely, every such prime power has exactly one distinct prime factor.

Because the smallest exponent is two, the base is below one million. Sieve all primes through that bound. For each prime `p`, begin at `p^2` and repeatedly multiply by `p` while the result remains below `10^12`, collecting every value. Different prime bases cannot generate the same integer, by uniqueness of factorization.

Sort the collected powers once. For a query, `lower_bound(low)` finds the first allowed value and `upper_bound(high)` finds the first value beyond the closed interval. Their iterator difference is the answer. Before multiplying, check `value > limit/p` to prevent overflow.

Almost primes are exactly prime powers with exponent at least two. Sieve primes through one million, list and sort powers below one trillion, then answer each query with two binary searches.
