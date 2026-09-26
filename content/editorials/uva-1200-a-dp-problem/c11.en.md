Do not be intimidated by the equation string. With no parentheses or multiplication/division, each side is just a sum of x terms and constants. Reduce it to ax+b=cx+d, then rearrange to (a−c)x=d−b.

The parser reads a sign, then any digits. If x follows, add that value to the coefficient; otherwise add it to the constant. A bare x has coefficient one, but an explicit 0x has coefficient zero. Track whether digits were present rather than testing whether their value is zero.

If a−c is zero, print IDENTITY when d−b is also zero and IMPOSSIBLE otherwise. In all other cases there is one rational solution. The output is its floor, not truncation toward zero: −3/2 must produce −2. C makes the denominator positive and subtracts one when a negative numerator has a nonzero remainder. Python // and Java Math.floorDiv already implement floor division.

An equation has at most 255 characters and input coefficients are at most 1000, so 64-bit totals are sufficient. Each character is processed once: O(L) time and constant state beyond the input string.
