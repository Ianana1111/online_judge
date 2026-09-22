# Precompute polynomial primes and answer ranges with prefix sums

## Problem and constraints

For every query `a b`, consider all integers `n` in the inclusive interval `[a,b]`, where `0 <= a <= b <= 10000`. We must print the percentage of values for which `n^2+n+41` is prime, rounded to two decimal places. Queries continue until end of file.

The task is not asking how many integers in `[a,b]` are prime. It asks whether the value produced by the polynomial is prime for each `n`. It is also unsafe to assume that every value from `n=40` onward is composite: although `n=40` produces `41^2`, later values may still be prime.

## Building the approach

The formula may suggest that we need a special theorem, but the small fixed domain is the more useful clue. There are only 10001 possible values of `n`, while there can be many queries. We can classify every possible `n` once, then turn each query into a range-count operation.

The largest polynomial value is `10000^2+10000+41 = 100010041`. To test such a value for primality, it is enough to try prime divisors up to its square root, which is slightly above 10000. We first sieve all primes through 10001, then use those primes to test every polynomial value.

Let `prefix[i]` be the number of prime-producing values among `n=0,1,...,i-1`. The number in `[a,b]` is then `prefix[b+1]-prefix[a]`. Dividing that count by `b-a+1` and multiplying by 100 gives the requested percentage. The implementation rounds the rational number with integer arithmetic, avoiding a floating-point surprise exactly at a rounding midpoint.

## Walkthrough

For `[0,39]`, all forty polynomial values are prime, so the answer is `100.00`.

For `[0,40]`, the additional value is

`40^2+40+41 = 1681 = 41^2`,

so forty of the forty-one values are prime. The percentage is about `97.5609`, which prints as `97.56`.

For `[39,40]`, exactly one of the two values is prime, so the answer is `50.00`. Notice how the prefix difference handles all three queries with the same formula, including intervals that start at zero.

## Why it works

Every composite positive integer has a prime divisor no greater than its square root. The sieve supplies every possible divisor needed for any polynomial value, so the trial-division step marks a value prime exactly when it has no such divisor.

Each prefix entry adds one precisely when its corresponding polynomial value is prime. Subtracting `prefix[a]` from `prefix[b+1]` cancels everything before `a` and leaves exactly the prime-producing positions from `a` through `b`. The denominator `b-a+1` is the size of that inclusive interval, so the final ratio is the required percentage. The integer rounding formula returns the nearest two-decimal representation of that exact ratio.

## Complexity

Let `B=10000` and let `Q` be the number of queries. The sieve costs `O(B log log B)`. Precomputation tries at most `pi(B+1)` divisors for each of `B+1` values, and every query is answered in `O(1)`. The prefix table and sieve use `O(B)` space.

## Common mistakes

- Testing whether `n` itself is prime instead of testing `n^2+n+41`.
- Assuming every value after `n=39` is composite.
- Using `b-a` as the interval length instead of `b-a+1`.
- Stopping trial division at `divisor^2 >= value`, which misses a divisor equal to the square root.
- Performing integer division before multiplying by 100.
- Building a huge sieve up to one hundred million when trial division by the much smaller prime list is sufficient.
