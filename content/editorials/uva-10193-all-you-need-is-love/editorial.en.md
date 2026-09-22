# A valid love value is a common divisor greater than one

## Problem and constraints

Two binary strings have length 2 through 30, begin with one, and represent positive integers. Determine whether another valid binary love value L can be repeatedly subtracted from both numbers until each reaches exactly L. A valid L also has at least two bits and no leading zero, so its numeric value is at least two. Up to 10,000 pairs are given.

## Building the approach

Repeatedly subtracting L from a positive integer S and stopping at L is possible exactly when S is a positive multiple of L. The same L must work for both values, so the question is whether they share any divisor at least two.

Parse each binary string into an integer using `value=value*2+bit`, compute their greatest common divisor, and test whether it is greater than one. No subtraction simulation or divisor enumeration is required. Thirty bits fit safely in signed `int` under the given maximum.

## Walkthrough

Binary `11011` is 27 and `11000` is 24. Their gcd is three, whose binary form `11` is a valid L, so love is possible.

Binary `10` and `11` represent two and three. Their gcd is one; although one divides both, its binary spelling has only one bit and is not a valid love value, so the negative response is required.

## Why it works

If a valid L exists, both numbers are multiples of it, so their gcd is at least `L>=2`. Conversely, if the gcd is at least two, its ordinary binary representation has no leading zero and at least two bits. It divides both numbers, and repeated subtraction reaches exactly that positive gcd.

Thus `gcd>1` is necessary and sufficient for a valid love string.

## Complexity

Parsing is linear in the at-most-30-bit strings, and Euclid's algorithm takes logarithmic time. Extra working space is constant.

## Common mistakes

- Accepting gcd one.
- Reading binary spelling as decimal.
- Checking only whether both values are even.
- Requiring the two input strings to match.
- Misformatting the case label or exclamation mark.
