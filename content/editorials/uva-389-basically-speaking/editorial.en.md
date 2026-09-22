# Keep exactly the seven displayed digits with modular conversion

## Problem and constraints

This site's version models a seven-digit display. Convert a number between bases 2 through 16 using uppercase digits `0-9` and `A-F`. Pad short results with leading zeros and keep only the rightmost seven digits of longer results. Every output line therefore contains exactly seven digits. This deliberately differs from the original UVa variant that right-aligns with spaces and prints `ERROR` on overflow.

## Building the approach

Keeping the last seven base-`b` digits is equivalent to taking the number modulo `b^7`. We never need the potentially enormous complete integer. Compute `modulus = b^7`, then read the source-base-`a` number from left to right using

`value = (value * a + digit) % modulus`.

After the whole string, `value` is precisely the part visible on the target display. Extract seven base-`b` digits by repeated division, filling positions from right to left. If the remaining value becomes zero, later remainders are zero and automatically provide the required padding.

## Walkthrough

Decimal 120 is hexadecimal 78, so the display is `0000078`. Decimal 128 is binary `10000000`; keeping the rightmost seven bits produces `0000000`. Zero also produces seven zeros. Leading zeros in the input are processed normally but do not change the numeric residue.

## Why it works

After any processed prefix, `value` is congruent modulo `b^7` to that prefix's true numeric value. Appending a source digit multiplies the old value by `a` and adds the digit, and modular arithmetic preserves the invariant. Thus the final residue equals the original number modulo `b^7`, exactly removing all target digits at positions seven and above. Seven repeated remainders reconstruct the remaining target digits in their correct positions.

## Complexity

For an input string of length `L`, conversion takes `O(L + 7)` time. Numeric working space is `O(1)` and storing the input string uses `O(L)`. Since `16^7 = 2^28`, all modular intermediates fit safely in `long long`.

## Common mistakes

- Implementing the different original UVa `ERROR` and space-padding rules.
- Keeping the leftmost seven digits on overflow.
- Parsing the entire input into a narrow integer before truncating.
- Preserving arbitrary input leading zeros beyond the fixed display width.
- Mapping `A` to 11 or outputting lowercase letters.
