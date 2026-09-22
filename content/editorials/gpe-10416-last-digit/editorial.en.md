# Find a period for the sum, not just for one power

## Problem and constraints

Find the last digit of `1¹ + 2² + ... + Nᴺ`. N can be as large as 2 × 10¹⁰⁰, so read it as a decimal string. A numeric value of zero ends input. A positive multiple of 100 is still a real case.

## Building the approach

Because only the last digit matters, every multiplication and addition can be reduced modulo ten. That avoids huge powers, but iterating up to N is still impossible. We need repeated structure in the sequence of terms.

The last digit of iⁱ repeats after 20 terms. Adding 20 preserves the base's last digit, and the exponent increases by a multiple of every possible last-digit power period: 1, 2, or 4. However, a repeating term sequence does not automatically make its prefix sums repeat with the same period.

The first 20 terms sum to 4 modulo ten. Five such blocks contribute 20, or zero modulo ten. Thus every complete block of 100 terms can be discarded, leaving only the prefix of length `N mod 100`. Precompute those 100 possible answers, and obtain the remainder by scanning N's decimal digits.

## Walkthrough

For N = 3, the sum is 1 + 4 + 27 = 32, so print 2. N = 20 gives 4, showing why keeping only `N mod 20` would fail. N = 100 gives zero, while N = 103 gives the same last digit as N = 3.

## Why it works

The simultaneous base and exponent shift of 20 preserves every term modulo ten. A 100-term block contains five identical 20-term blocks and contributes zero. The leftover terms therefore have the same contribution as the initial prefix of that length. Updating a decimal remainder by `(remainder * 10 + digit) % 100` preserves the value of the digits read so far modulo 100.

## Complexity

Precomputation uses fewer than 5,000 small modular multiplications. A query with L digits takes O(L) time and O(L) input storage; the table uses O(100) space.

## Common mistakes

- Reading N into a fixed-width integer.
- Confusing the 20-term period with the prefix-sum period.
- Treating a zero remainder as the input sentinel.
- Computing large powers with floating-point `pow`.
