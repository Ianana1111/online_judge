The formula may suggest that we need a special theorem, but the small fixed domain is the more useful clue. There are only 10001 possible values of `n`, while there can be many queries. We can classify every possible `n` once, then turn each query into a range-count operation.

The largest polynomial value is `10000^2+10000+41 = 100010041`. To test such a value for primality, it is enough to try prime divisors up to its square root, which is slightly above 10000. We first sieve all primes through 10001, then use those primes to test every polynomial value.

Let `prefix[i]` be the number of prime-producing values among `n=0,1,...,i-1`. The number in `[a,b]` is then `prefix[b+1]-prefix[a]`. Dividing that count by `b-a+1` and multiplying by 100 gives the requested percentage. The implementation rounds the rational number with integer arithmetic, avoiding a floating-point surprise exactly at a rounding midpoint.

Classify all polynomial values once, then build a prefix count. Each range query is one subtraction; integer arithmetic rounds the percentage to two decimals.
