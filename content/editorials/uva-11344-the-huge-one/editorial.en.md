# Stream each huge decimal number through small remainders

## Problem and constraints

Given a nonnegative decimal integer `M` as large as `10^1000` and a set of distinct divisors from 1 through 12, classify `M` as `Wonderful` if every divisor divides it, or `Simple` otherwise. The inclusive upper bound can contain 1,001 digits. Zero is divisible by every positive divisor.

## Building the approach

Read `M` as a string. For one divisor `d`, the complete number is unnecessary; only the remainder of the prefix processed so far matters. Starting from zero, update

`remainder = (10 * remainder + digit) % d`

for every decimal digit. The final remainder is `M mod d`. Repeat this scan for every requested divisor and keep the result wonderful only if all remainders are zero.

Read the full divisor list before testing it. This keeps input aligned even after an early failed condition. Preserve the original number string for the required output instead of trying to reconstruct a huge integer.

## Walkthrough

For `M=10` and divisors `{1,2,9}`, the first two tests succeed but the remainder modulo 9 is 1, so the result is `Simple`. For `M=0` and `{7,11,12}`, every update stays zero, so the result is `Wonderful`.

For 123 modulo 7, the prefix remainders are 1, 5, and 4. The last value is exactly `123 mod 7`, even though no complete integer conversion is needed.

## Why it works

Assume a processed prefix `P` has remainder `r` modulo `d`. Appending decimal digit `x` produces `10P+x`, whose remainder is `(10r+x) mod d` by the arithmetic of congruences. Starting from the empty prefix zero, induction over all digits proves that the final stored value is the exact remainder of `M`. Requiring that value to be zero for every listed divisor is precisely the definition of `Wonderful`.

## Complexity

For `D` digits and `K` divisors, the running time is `O(DK)` and storage is `O(D+K)`. Here `D<=1001` and `K<=12`; each intermediate remainder is tiny.

## Common mistakes

- Trying to read the number into `long long`.
- Testing only the final decimal digit.
- Overwriting the accumulated classification so only the last divisor matters.
- Stopping input consumption after the first failed divisor.
- Classifying zero as automatically simple.
