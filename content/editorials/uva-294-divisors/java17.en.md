For factorization `n=product p^e`, divisor count is `product(e+1)`. Sieve primes through `sqrt(10^9)`. For every interval number keep a remaining value and count initialized to one.

For each prime through `sqrt(U)`, visit only its multiples inside the interval, divide that prime out completely, and multiply count by exponent plus one. After all small primes, any remaining value above one is one additional prime factor, so multiply by two. Scan numbers increasing and update the best only on strict improvement.

Factor the whole short interval together. Visit each prime’s multiples, multiply by exponent plus one, and double for a remaining large prime. On ties, keep the earliest number.
