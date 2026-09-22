# Test complete repeating prefixes from shortest to longest

## Problem and constraints

A string has period `k` when it is formed by repeating one length-`k` string a whole number of times. Find the smallest period for each nonempty string of length at most 80. A single repetition is allowed, so the full length always works. Input and output cases are separated by blank lines.

## Building the approach

Try candidate lengths `k` from 1 through `n`. Complete repetition requires `k` to divide `n`; skip every other candidate. For a divisor, position `i` must equal the corresponding template character `text[i % k]`. If every position matches, the first `k` characters repeat to form the whole string.

The first successful candidate is minimal because lengths are tested in increasing order. The divisibility check is essential: `ababa` resembles a period-two pattern but ends with only half of another copy, so two is not a valid period.

## Walkthrough

`abcabcabcabc` has periods 3, 6, and 12; the first valid one is 3. `aaaa` has period 1. `ababa` has no shorter complete repetition and returns 5. A one-character string naturally returns 1.

## Why it works

If `k` is a period, there are exactly `n/k` full copies, so `k` divides `n` and every position equals its index modulo `k` in the first copy. Conversely, if divisibility and all modulo comparisons hold, the string partitions into identical length-`k` blocks, proving that `k` is a period. Increasing search order therefore returns the smallest one.

## Complexity

At most `n` candidates each inspect `O(n)` characters, for `O(n^2)` time. Extra working space is `O(1)` beyond the input string.

## Common mistakes

- Accepting an incomplete final repetition without checking `n % k`.
- Continuing after the first period and ending with `n`.
- Comparing only a few prefix or suffix characters.
- Treating separator blank lines as empty test strings.
- Omitting blank lines between results.
