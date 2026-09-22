The sieve marks primes, then four prefix arrays track prime counts and sums, and twin-prime counts and sums. A twin entry at `value` represents the larger prime in `(value - 2, value)`, which is also the three-cell shape's span. This explains why `n * twinCount[n - 1] - twinSum[n - 1]` counts its translations before multiplying by two for reflections.

`supports[1..4]` stores the number of occupied-position sets. The prime prefix query stops at `n - 1`, the largest possible distance in a row of n cells. The four-cell count clips `n - 7` at zero.

`chooseSmall` needs only lower indices zero through three. It multiplies the falling factors modulo MOD, then multiplies by the precomputed modular inverse of the factorial. Returning zero when there are too few gaps excludes K > M. Each support is reduced before multiplying by its composition count, keeping intermediate products within `long long` range.
