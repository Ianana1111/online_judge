`hasDigits` distinguishes an absent coefficient from an explicit zero, while `value` accumulates multiple decimal digits. Each term begins with a fresh positive sign and updates coefficient or constant separately.

Splitting at `=` produces `(a,b)` and `(c,d)`, then numerator `d-b` and denominator `a-c`. Zero denominator is handled before division. A negative denominator flips both signs, and the final decrement occurs only for a negative nonzero remainder.
