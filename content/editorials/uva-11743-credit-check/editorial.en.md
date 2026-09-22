# Preserve all sixteen digits and apply the Luhn checksum

## Problem and constraints

Each input consists of sixteen decimal digits in four groups. Starting from the second digit from the right and moving left alternately, double those digits and sum the decimal digits of each doubled result. Add untouched digits normally. The number is `Valid` exactly when the total is divisible by 10. This verifies only the stated checksum, not a real account.

## Building the approach

Read all four groups as strings and concatenate them, preserving leading zeros. With fixed indices 0 through 15, the second-from-right index is 14, so exactly the even indices are doubled.

For digit `d`, doubled value ranges from 0 through 18. When above 9, its digit sum is `2d-9`, so subtract 9 rather than converting it to text. Sum each processed contribution once and test modulo 10.

## Walkthrough

At a doubled position, 8 becomes 16 and contributes 7; 5 becomes 10 and contributes 1. At an untouched position, 8 still contributes 8. Sixteen zeros have checksum zero and are valid under this pure algorithm; no outside banking rule should reject them.

## Why it works

For a fixed sixteen-digit string, alternating leftward from the second-last digit is exactly the set of zero-based even indices. Doubled values 10 through 18 always have tens digit 1 and ones digit `2d-10`, whose sum is `2d-9`; smaller values are already one digit. Thus every computed contribution matches Luhn's definition, and divisibility of their exact total is the required classification.

## Complexity

Each case processes exactly sixteen digits in `O(1)` time and space.

## Common mistakes

- Reading the number as an integer and losing leading zeros.
- Doubling odd indices instead of even ones.
- Adding 10 through 18 without summing their digits.
- Counting spaces as positions.
- Printing extra account or case information.
- Treating checksum validity as proof of a real card.
