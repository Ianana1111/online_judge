Read `M` as a string. For one divisor `d`, the complete number is unnecessary; only the remainder of the prefix processed so far matters. Starting from zero, update

`remainder = (10 * remainder + digit) % d`

for every decimal digit. The final remainder is `M mod d`. Repeat this scan for every requested divisor and keep the result wonderful only if all remainders are zero.

Read the full divisor list before testing it. This keeps input aligned even after an early failed condition. Preserve the original number string for the required output instead of trying to reconstruct a huge integer.

Zero has remainder zero for every divisor, so the same code naturally marks it Wonderful.
