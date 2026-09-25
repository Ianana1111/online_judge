Read each case as a separate line with `BufferedReader`, then split its prime/exponent pairs with `StringTokenizer`. Reconstruct the complete number before subtracting one and factoring it again; cases can have different numbers of pairs, so line boundaries matter.

Trial-divide `X-1` from 2, removing each factor completely and storing its exponent. If a remainder above one survives, append it as the final prime. The saved factors are ascending, so print them backward. The small integer bound makes this direct approach sufficient and avoids floating-point powers.
