Positive denominators let us compare `d1/v1 < d2/v2` by the exact integer inequality `d1*v2 < d2*v1`. Floating point is unnecessary and may merge extremely close legal values.

The mean is `(d1*v2+d2*v1)/(2*v1*v2)`. Compute both parts in 64 bits and divide them by their greatest common divisor. Print only the numerator when the reduced denominator is one.

Put both times over a common denominator, average them, then print a slash only for a noninteger result.
