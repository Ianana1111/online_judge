# Precompute digit primes and answer every interval with a prefix sum

## Problem and constraints

A digit prime is an integer that is prime and whose decimal digit sum is also prime. Answer up to 500000 inclusive interval queries `[L,R]`, where `1 <= L <= R < 1000000`. Both primality conditions are required, and one is not prime.

## Building the approach

The huge query count rules out scanning each interval. The global upper bound is fixed, so preprocess every possible value once.

Use the Sieve of Eratosthenes to mark primality below one million. Then build `prefix[x]`, the number of digit primes from one through `x`. For each value, compute its digit sum by repeated `% 10` and `/ 10`; increment the inherited prefix count only if both table entries are prime.

An inclusive query is answered by `prefix[R]-prefix[L-1]`, which removes exactly the values before the left endpoint.

## Walkthrough

`41` is prime and its digit sum five is prime, so it qualifies. `17` is prime but its digit sum eight is not. Therefore `[2,2]` has answer one, while `[1,1]` has answer zero. The latter correctly reads the initialized `prefix[0]`.

## Why it works

The sieve marks multiples of each prime as composite. Beginning at `p^2` misses no composite because smaller multiples already have a smaller prime factor, so the final table exactly identifies primes.

At each value, the prefix recurrence carries the previous count and adds one precisely for the two required prime conditions. By induction, `prefix[x]` counts all digit primes through `x`. Subtracting the prefix through `L-1` from the prefix through `R` leaves exactly those in the closed interval.

## Complexity

For `U=10^6`, sieving costs `O(U log log U)`, digit processing costs `O(U log U)` under a simple digit-count bound, and each query is `O(1)`. Tables use `O(U)` space.

## Common mistakes

- Checking only the value's primality or only the digit sum's primality.
- Treating one as prime.
- Using `prefix[R]-prefix[L]` and excluding the left endpoint.
- Rescanning or trial-dividing every query interval.
- Using slow forced flushing for hundreds of thousands of answers.
