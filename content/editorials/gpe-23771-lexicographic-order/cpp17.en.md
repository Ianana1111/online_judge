`factorial[0]=1` lets the last symbol use the same quotient formula. The remaining rank is always below the factorial of the remaining count, so its quotient is a valid index in `available`.

`order` is the alphabet being reconstructed, while `word` remains the known ranked permutation. After placing one character, erasing its selected position makes the next quotient relative to only the remaining positions. Taking the remainder discards the completed factorial block and carries the exact suffix rank forward.
