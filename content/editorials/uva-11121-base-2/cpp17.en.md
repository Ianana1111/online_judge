The double modulo in `(n % 2 + 2) % 2` turns the remainder of a negative odd number from `-1` into 1 while leaving every even remainder at zero. Consequently, `n - bit` is always even and division by `-2` is exact.

The `do-while` executes once for zero and appends its required digit. Digits are appended in extraction order and reversed only after the quotient reaches zero. The case label and digit string are printed without any separate sign.
