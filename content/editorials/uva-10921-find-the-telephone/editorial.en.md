# Map each uppercase letter and preserve the local count fields

## Problem and constraints

Each line contains an uppercase telephone expression of length one through thirty using letters, hyphens, zero, and one. Convert letters by the telephone keypad and preserve other characters. This site's CPE contract additionally requires the number of letters and hyphens after the converted expression; omitting them follows the original UVa format but is wrong here. Input continues to EOF.

## Building the approach

Use a 26-character lookup indexed by `ch-'A'`: ABC map to 2, DEF to 3, through PQRS to 7, TUV to 8, and WXYZ to 9. An explicit table correctly handles the two four-letter keys.

Scan the mutable string. For an uppercase letter, increment `letters` before replacing it from the table. For a hyphen, increment `hyphens` and leave it unchanged. Zero and one match neither branch and also remain unchanged.

Counts reset for each input expression, and a single `0` is ordinary data rather than a sentinel.

## Walkthrough

`1-HOME-SWEET-HOME` becomes `1-4663-79338-4663` and contains 13 letters and three hyphens. Thus the same line ends with `13 3`.

`PQRS-WXYZ` becomes `7777-9999 8 1`, confirming that S stays on seven and W through Z stay on nine.

## Why it works

The lookup explicitly lists the required key for every uppercase letter, so every replacement is correct. Each original character is visited once; only original letters increment the letter counter, and only original hyphens increment the hyphen counter. Unmatched characters and order remain unchanged.

Therefore the converted expression and both local-format counts are exact.

## Complexity

For expression length C, time is `O(C)` and additional working space is `O(1)` beyond the string.

## Common mistakes

- Printing only the converted number and omitting this site's two counts.
- Dividing alphabet indices into uniform groups of three, misclassifying S or WXYZ.
- Counting letters after replacement, when they have become digits.
- Removing hyphens.
- Treating a line containing zero as termination.
