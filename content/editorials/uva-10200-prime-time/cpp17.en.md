The first sieve creates only the prime divisors needed for trial division; it does not allocate a primality table through the largest polynomial value. For each `n`, the divisor loop must still test equality at the square root, so it stops only when `divisor * divisor > value`.

`prefix` has one extra entry and begins with `prefix[0]=0`. Therefore even a query with `a=0` uses the uniform expression `prefix[b+1]-prefix[a]`.

`fixed_ratio` receives an exact numerator and denominator before either is converted to floating point. It scales the fraction by `10^digits`, rounds the nonnegative rational value to the nearest integer, then separates the integer and fractional parts. Padding the fractional string ensures that values such as zero and one hundred are printed as `0.00` and `100.00`. The caller multiplies the prime count by 100, so the fraction passed to the helper already represents a percentage.
