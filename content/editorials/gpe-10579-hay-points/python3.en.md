`Fraction(amount)` receives the original decimal text, avoiding a prior conversion through binary floating point. Each description begins with `Fraction(0)`, and `values.get(word, 0)` gives unknown words their required zero contribution.

The shared token iterator is consumed up to `'.'` for each description. Because the valid terminator is a standalone period, token-based parsing can ignore ordinary line breaks without merging descriptions.

In `decimal_string`, the denominator is factored into powers of two and five. The larger exponent determines a power of ten divisible by the entire denominator. Multiplying the numerator by the missing factor gives exact scaled units. Integer division and a zero-padded remainder form the decimal text; stripping trailing zeros applies only to the fractional result. Integral results return directly, including zero.
