# Reconstruct the integer, subtract one, and factor it again

## Problem and constraints

Each line describes an integer `X` by descending prime and positive-exponent pairs, with `2 < X <= 32767`. Output the prime factorization of `X-1`, again in descending prime order. A line containing only zero ends input. The number of pairs differs by line, so line boundaries define cases.

## Building the approach

Start at one and multiply by each prime exactly its exponent number of times to reconstruct `X` with integer arithmetic. Set `rest = X-1`, then trial-divide candidates from 2 upward. For every divisor, repeatedly divide it out and record the complete exponent.

When `d*d > rest`, any remaining value above one is prime and has exponent one; otherwise a smaller factor would already have been found. Trial division discovers factors in ascending order, so reverse the recorded list for output.

The subtraction applies to the reconstructed whole integer. Subtracting from individual primes or exponents does not represent `X-1`.

## Walkthrough

`5 1 2 1` represents `X = 10`; `X-1 = 9 = 3^2`, so output is `3 2`. Input `17 1` becomes `16 = 2^4`, producing `2 4`. If `X-1` itself is prime, the trial loop records nothing and the final residual-prime branch outputs it with exponent one.

## Why it works

Repeated integer multiplication exactly reconstructs the supplied prime product. During trial division, all factors smaller than the current candidate have been removed. Whenever `d` divides, it must be the next prime factor, and repeated division finds its full multiplicity. If the loop ends with composite `rest`, that composite would have a factor at most its square root that should already have been tested, a contradiction. Thus the recorded factors multiply exactly to `X-1`; reversing changes only their required display order.

## Complexity

Reconstruction uses `O(sum e)` multiplications and factorization takes `O(sqrt(X))` trial candidates in the worst case. Stored factor pairs use `O(log X)` space.

## Common mistakes

- Factoring `X` without subtracting one.
- Replacing each prime by `p-1` before multiplication.
- Omitting the final residual prime.
- Printing factors in ascending order.
- Reading all tokens without preserving case-defining line boundaries.
