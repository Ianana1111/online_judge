Do not use double for decimal exponentiation: the output must be complete and exact. Remove the input decimal point to obtain an integer coefficient, and record k fractional digits. The value is coefficient/10^k, so its nth power is coefficient^n/10^(k·n).

C/C++ multiply the decimal integer string n times, then restore the decimal point k·n positions from the right. Pad with zeros when necessary: squaring 0.02 first produces integer 4, but four fractional places give 0.0004, formatted as .0004 after removing the leading zero.

Remove insignificant trailing zeros only from the fractional part. The zeros in integer 1000 are meaningful and must remain. If the fractional part disappears, remove the decimal point too. Java BigDecimal.pow is exact; after stripTrailingZeros, use toPlainString to prevent scientific notation.

Input fits six columns and n≤25, so the powered integer has at most roughly 150 digits. Grade-school multiplication costs the product of operand lengths; repeated multiplication has a conservative O(nD²) bound, where D is the largest result length, with O(D) space. The key idea is to preserve decimal placement as separate integer information.
