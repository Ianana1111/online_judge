`excess` is `n-m`, the number of elements beyond the mandatory one per set. `overlap` is the number of surviving odd generating-function factors minus one. Their bitwise AND is zero exactly when the relevant binomial coefficient is odd.

The program does not reduce the problem to the ordinary parity of `n` and `m`; higher binary bits matter too. The zero-based case counter prints a blank line only before the second and later answers, avoiding an extra leading separator.
