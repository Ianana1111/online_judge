The input loop excludes zero before creating the per-case bit string and counter. Each `% 2` result is both appended as a character and added numerically to `ones`.

Dividing the input variable is harmless because the decimal original is not part of the output. Once it reaches zero, `reverse` converts extraction order to normal binary order.

The program inserts the complete `ones` count directly into the fixed sentence; `(mod 2)` remains literal required text.
