# Use digit-sum congruence to find the smallest base

## Problem and constraints

An optionally signed numeral uses digit symbols `0-9`, `A-Z`, and `a-z` for values 0 through 61. Find the smallest base `B` from 2 through 62 in which the numeral is legal and its value is divisible by `B-1`. If none works, print the specified impossible message. Input continues to EOF; zero is an ordinary numeral.

## Building the approach

In base B, a numeral is a sum of digit values times powers of B. Modulo `B-1`, B equals one, so every power of B also equals one. The complete numeral is therefore congruent to the sum `S` of its digit values.

Compute `S` and the maximum digit value `m`, ignoring an optional sign. A legal base must be at least `m+1` and at least two. Test bases upward from `max(2,m+1)` through 62; the first satisfying `S%(B-1)==0` is the minimum answer.

No full integer conversion is needed, so arbitrarily long numeral text cannot overflow. Negating a value does not change whether it is divisible.

## Walkthrough

For `A`, digit value is ten, so the base is at least 11. Ten is divisible by `11-1`, making 11 the answer.

For `z1`, the sum is 62 and the largest digit is 61, leaving only base 62; 62 is not divisible by 61, so no base works. For `0`, sum and maximum are zero and base two is immediately valid.

## Why it works

The modular identity proves that divisibility of the represented number by `B-1` is equivalent to divisibility of its digit sum. The lower bound rejects exactly those bases in which some digit is invalid, and enumeration covers every allowed legal base.

Testing in increasing order makes the first success minimal. If all candidates fail, no permitted base satisfies both legality and divisibility.

## Complexity

For length `L`, digit scanning takes `O(L)` and at most 61 bases are tested. Extra working space is constant beyond the input string.

## Common mistakes

- Mapping lowercase `a` to 10 instead of 36.
- Allowing a digit value equal to the base.
- Treating the sign as a digit.
- Converting the whole numeral into fixed-width storage.
- Searching in a direction that does not guarantee the minimum.
