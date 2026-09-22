# Extract binary digits by division and count every one bit

## Problem and constraints

For each positive integer up to 2147483647, print its binary representation without leading zeroes and the total number `P` of one bits. Zero terminates input. Although the sentence ends with `(mod 2)`, P itself is the full count, not P modulo two.

## Building the approach

Repeatedly take `value % 2` to obtain the current least significant bit, append its character, add it to the one counter, and divide the value by two to remove that bit.

The extracted sequence runs from least significant to most significant, opposite normal notation, so reverse the string afterward. The final extracted bit of a positive value is one, ensuring no leading zero after reversal.

This generates only the necessary digits rather than a fixed-width 32-bit string.

## Walkthrough

For 21, remainders are `1,0,1,0,1`; reversing gives `10101` and the count is three.

For 10, remainders are `0,1,0,1`, so the temporary string `0101` must become `1010`; the count is two.

## Why it works

Integer division gives `value=2*quotient+remainder`, where remainder is zero or one. Thus every iteration extracts exactly the current low binary bit and replaces the number by all remaining higher bits. Repeating to zero enumerates every bit exactly once.

Summing extracted bits counts all ones, and reversing restores highest-to-lowest order, proving both outputs correct.

## Complexity

For B binary digits, time and string space are `O(B)`. Here B is at most 31.

## Common mistakes

- Printing `ones%2` instead of the full one count.
- Forgetting to reverse the low-bit-first string.
- Processing the zero sentinel as a case.
- Printing a fixed-width representation with leading zeroes.
- Omitting the required punctuation.
