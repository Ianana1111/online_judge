# Factor every number in the narrow interval with a segmented prime sweep

## Problem and constraints

In inclusive `[L,U]`, find the integer with the most positive divisors, choosing the smallest on ties. Endpoints reach `10^9`, but width is at most 10,000. One and the number itself count as divisors.

## Building the approach

For factorization `n=product p^e`, divisor count is `product(e+1)`. Sieve primes through `sqrt(10^9)`. For every interval number keep a remaining value and count initialized to one.

For each prime through `sqrt(U)`, visit only its multiples inside the interval, divide that prime out completely, and multiply count by exponent plus one. After all small primes, any remaining value above one is one additional prime factor, so multiply by two. Scan numbers increasing and update the best only on strict improvement.

## Walkthrough

Between 1 and 10, both 6 and 8 have four divisors, so choose 6. `1000=2^3*5^3` has 16 divisors. A large prime singleton retains its original value after small division and needs the final factor two.

## Why it works

Each divisor uniquely selects exponents from zero through e, proving the product formula. Visiting prime multiples removes exactly each number's full exponent independently. Any composite residual would contain a prime no greater than its square root and hence no greater than `sqrt(U)`, contradicting completion, so residual is at most one prime. Exact counts followed by strict maximum scanning satisfy both optimum and tie rules.

## Complexity

The sieve costs `O(B log log B)` for `B=31622`; interval work is bounded by prime-multiple visits and factor divisions over at most 10,001 numbers, with `O(W+B)` space.

## Common mistakes

- Updating on ties and choosing the larger number.
- Omitting the residual large prime.
- Excluding U.
- Giving one zero divisors.
- Trial-dividing every candidate up to itself.
