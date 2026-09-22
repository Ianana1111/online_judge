# Enumerate every prime power with exponent at least two

## Problem and constraints

An almost prime is a nonprime positive integer with exactly one distinct prime factor. Count such numbers in each closed interval `[low,high]`, where `0 < low <= high < 10^12`, for up to 600 queries. One has no prime factor and is not included.

## Building the approach

Unique prime factorization turns the definition into a precise form: a number with only prime factor `p` must be `p^k`. Since the number itself must not be prime, `k>=2`. Conversely, every such prime power has exactly one distinct prime factor.

Because the smallest exponent is two, the base is below one million. Sieve all primes through that bound. For each prime `p`, begin at `p^2` and repeatedly multiply by `p` while the result remains below `10^12`, collecting every value. Different prime bases cannot generate the same integer, by uniqueness of factorization.

Sort the collected powers once. For a query, `lower_bound(low)` finds the first allowed value and `upper_bound(high)` finds the first value beyond the closed interval. Their iterator difference is the answer. Before multiplying, check `value > limit/p` to prevent overflow.

## Walkthrough

From one through ten, the qualifying numbers are `4=2^2`, `8=2^3`, and `9=3^2`, so the answer is three. Through twenty, `16=2^4` adds a fourth. Twelve has two distinct prime factors and is excluded, while two and three are prime and also excluded.

For the single-point interval `[4,4]`, lower and upper bounds enclose exactly one collected value.

## Why it works

Every target number has a unique prime factorization with one base and exponent at least two, so it appears in the enumeration for that prime. Every enumerated `p^k` likewise satisfies the definition. The base bound follows from `p^2 < 10^12`, repeated multiplication lists every legal exponent, and unique factorization prevents duplicates across bases.

After sorting, everything before `lower_bound(low)` is too small and everything at or after `upper_bound(high)` is too large. The elements between them are exactly the target values in the closed query range.

## Complexity

With sieve bound `B=10^6` and `P` generated powers, preprocessing takes `O(B log log B + P log P)` time and `O(B+P)` space. Each query takes `O(log P)`.

## Common mistakes

- Starting from `p` and incorrectly counting primes.
- Enumerating only prime squares and missing cubes and higher powers.
- Counting arbitrary composite numbers with several prime factors.
- Using `lower_bound` on both ends and excluding a value equal to `high`.
- Multiplying first and checking the limit only after overflow.
