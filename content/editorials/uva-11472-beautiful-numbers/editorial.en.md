# Track the last digit and every digit already visited

## Problem and constraints

In base `N`, count positive numbers of at most `M` digits that use every digit from 0 through `N-1`, never begin with zero, and have adjacent digits differing by exactly one. Digits may repeat. Here `2<=N<=10`, `0<=M<=100`, and answers are modulo 1,000,000,007.

## Building the approach

The next-digit rule depends only on the current last digit, while the coverage rule depends on the set of all digits seen. Represent that set by a bitmask and keep `dp[mask][last]` for one exact length.

Initialize length one with digits 1 through `N-1`; zero is excluded only at the start. From a state, append `last-1` or `last+1` when it lies in the base, and set its mask bit. After each length, sum states whose mask is full. Add that exact-length count to the preceding prefix answer because the query asks for at most `M` digits.

Precompute every base 2 through 10 and length through 100. Length zero remains zero because the empty string is not a number.

## Walkthrough

In base 2, a valid number must alternate 1 and 0. Lengths two, three, and four contribute `10`, `101`, and `1010`, so the answer up to four digits is 3. In base 10 with at most ten digits, all digits must appear exactly once; `9876543210` works, while the increasing direction begins with forbidden zero.

## Why it works

The initialization lists exactly all legal first digits. Any longer legal number has a unique previous prefix and last appended digit, and that digit must be one of the two transitions. Updating the mask records coverage exactly, so induction on length proves that every state counts precisely its represented numbers without duplication. A full mask is equivalent to having used every digit at least once. Different lengths represent different numbers, so prefix-summing their full-mask counts gives exactly the requested upper-length total.

## Complexity

For one base, preprocessing takes `O(100 * N * 2^N)` time and `O(N * 2^N)` rolling state. Each query is `O(1)`.

## Common mistakes

- Counting only numbers of exactly `M` digits.
- Allowing zero as the first digit.
- Forbidding repeated digits.
- Storing only the last digit and losing the coverage condition.
- Updating the current layer in place and appending multiple digits in one step.
