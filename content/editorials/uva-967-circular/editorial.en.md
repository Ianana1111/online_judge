# Sieve every prime, test all rotations, and answer ranges with prefix sums

## Problem and constraints

A circular prime remains prime after repeatedly moving its leftmost digit to the right end. For every inclusive range `[left, right]`, where `100 <= left <= right < 1,000,000`, count the circular primes. A line containing only `-1` ends the input. Rotated values are still separate integers when they occur in the range; a rotation family is not counted as one object.

## Building the approach

Testing every number again for every query would repeat almost all the work. Since the global upper bound is fixed, first determine primality for every value below one million with the Sieve of Eratosthenes. Then classify each number once and store cumulative counts in a prefix array.

For a `d`-digit value, let `power = 10^(d-1)`. Moving the leading digit to the end is

`(value % power) * 10 + value / power`.

Test the original value and the next `d-1` rotations. If any is composite, the value is not circular. The same `power` must remain in use for the whole cycle, even when a rotation begins with zero and its integer form appears to have fewer digits.

Finally, the inclusive range count is `prefix[right] - prefix[left - 1]`.

## Walkthrough

For `113`, the rotations are `113`, `131`, and `311`; all three are prime, so `113` is circular. The values `131` and `311` are also counted independently if they lie in the queried range. By contrast, `119` fails immediately because the original value is composite.

## Why it works

The sieve marks exactly the composite values: every composite has a prime factor no larger than its square root, and the multiples of every such prime are marked. The rotation formula removes the highest digit, shifts the remaining digits left, and appends that digit, exactly matching the definition.

Checking the original and `d-1` subsequent rotations visits every cyclic position once. Therefore `good` is true exactly for circular primes. Since `prefix[v]` adds the indicator for every individual value up to `v`, subtracting `prefix[left-1]` from `prefix[right]` counts exactly the valid values in the inclusive interval.

## Complexity

With `U = 1,000,000`, the sieve takes `O(U log log U)` time. Classification uses at most six rotations per value, so it is `O(U)` for this fixed digit bound. The arrays use `O(U)` space, and every query takes `O(1)` time.

## Common mistakes

- Checking only the original number for primality.
- Counting an entire rotation family only once.
- Ignoring rotations that fall outside the current query range.
- Using `prefix[right] - prefix[left]` and losing the left endpoint.
- Recomputing the digit length after a rotation begins with zero.
- Printing the plural sentence when the answer is exactly one.
