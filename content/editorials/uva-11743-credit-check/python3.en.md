Read all four groups as strings and concatenate them, preserving leading zeros. With fixed indices 0 through 15, the second-from-right index is 14, so exactly the even indices are doubled.

For digit `d`, doubled value ranges from 0 through 18. When above 9, its digit sum is `2d-9`, so subtract 9 rather than converting it to text. Sum each processed contribution once and test modulo 10.

Subtract nine when a doubled digit exceeds nine; this equals summing its decimal digits.
