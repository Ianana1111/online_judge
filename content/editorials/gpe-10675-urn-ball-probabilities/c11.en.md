Repeatedly multiplying failure probabilities and subtracting the product from one can erase a tiny difference. Accumulate `log1p(-1/(k(k+1)))` instead and use `-expm1(logSurvival)` to recover the probability of at least one success. These functions preserve accuracy near zero.

The all-red probability has denominator N!·(N+1)!, so its leading-zero count is the floor of `2·log10(N!)+log10(N+1)`. Sort queries by N and advance one running prefix rather than rebuilding it for each query. Use compensated summation for both logarithm totals, restore original query order, and handle N=0 explicitly.
