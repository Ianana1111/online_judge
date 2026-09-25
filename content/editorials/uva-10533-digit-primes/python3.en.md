The huge query count rules out scanning each interval. The global upper bound is fixed, so preprocess every possible value once.

Use the Sieve of Eratosthenes to mark primality below one million. Then build `prefix[x]`, the number of digit primes from one through `x`. For each value, compute its digit sum by repeated `% 10` and `/ 10`; increment the inherited prefix count only if both table entries are prime.

An inclusive query is answered by `prefix[R]-prefix[L-1]`, which removes exactly the values before the left endpoint.

A byte sieve and fixed-width prefix array save memory, while chunked parsing handles up to half a million queries.
