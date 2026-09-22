The probability token is retained as text and converted with `strtold`. Inspecting nonzero digits before any exponent distinguishes mathematical zero from a positive value too small for the floating representation; the latter correctly tends to the four-decimal limit `1/N` when `q` rounds to one.

`weight` begins at the first player's value one, `total` accumulates all N weights, and `target` records the chosen player. Multiplication by `q` advances one player. For actual zero, the initialized result remains zero. Fixed formatting with precision four applies to every branch.
