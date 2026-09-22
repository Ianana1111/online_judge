# Count consecutive-prime sums with a sliding window

## Problem and constraints

For each integer from 2 through 10,000, count representations as a sum of one or more consecutive primes. Consecutive means adjacent in the increasing prime sequence; primes may not be skipped or reused. Zero terminates input. A prime by itself is a valid one-term representation.

## Building the approach

First use the sieve of Eratosthenes to build all primes through 10,000 in increasing order. For one target, maintain a contiguous window with two pointers and its sum. Extend the right edge by one prime. While the sum is too large, remove primes from the left until it is no larger than the target. If it equals the target, count one representation.

All prime values are positive. For a fixed right edge, moving the left edge strictly decreases the sum, so at most one left position can match the target. Once a left position has been discarded for an excessive sum, later right extensions cannot make that old window smaller, so it never needs to return.

Stop adding when the next prime exceeds the target, since no nonempty window containing it can match.

## Walkthrough

Forty-one has three representations: `2+3+5+7+11+13`, `11+13+17`, and the single term `41`. Twenty has none; `7+13` is not allowed because it skips 11 in the prime sequence. Three has one representation consisting of itself.

## Why it works

When a window sum exceeds the target, every window with the same right endpoint and an earlier left endpoint is at least as large and cannot be valid. Removing left terms until the sum is small enough is therefore safe. Once small enough, removing another positive term would make it still smaller, so any match for that right endpoint is the current window.

Both pointers move only forward. Every valid consecutive prime interval is present exactly when its right endpoint is added, and it is counted once before either endpoint passes it. Thus no representation is missed or duplicated.

## Complexity

Sieve precomputation takes `O(U log log U)` for `U=10000`. Each query moves both pointers across at most the prime list, taking `O(P)` time and `O(1)` query space; the sieve and list use `O(U)` storage.

## Common mistakes

- Counting arbitrary prime subsets instead of consecutive intervals.
- Excluding single-prime representations.
- Removing only one left value when the sum can remain excessive.
- Failing to reset window state for each query.
- Including one in the prime list.
