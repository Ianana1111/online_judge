# Reduce MSLCM to divisor sums and group equal quotients

## Problem and constraints

MSLCM(N) is the maximum sum of a set of distinct positive integers whose LCM is N. For `N<=20,000,000`, compute the sum of MSLCM(i) from 2 through N. Up to 200 queries precede zero.

## Building the approach

Every legal set element divides N. Adding every positive divisor increases the sum, and because N itself is included, the LCM remains N. Therefore MSLCM(N) is exactly `sigma(N)`.

Swap summations: `sum_{i=1..N} sigma(i) = sum_{d=1..N} d*floor(N/d)`. For current left, quotient q remains constant through `right=floor(N/q)`. Add q times the arithmetic sum of left through right, jump to right+1, and subtract `sigma(1)=1` at the end.

## Walkthrough

For N=4, divisor sums for 2,3,4 are 3,4,7, totaling 14. Swapped summation gives `1*4+2*2+3*1+4*1=15`, then subtracts one. For N=10, all d from 6 through 10 share quotient one and form one block.

## Why it works

All-divisors is the legal maximum set. In the finite double sum, divisor d appears in exactly its `floor(N/d)` multiples, proving the exchanged identity. Integer division has constant quotient q exactly through `floor(N/q)`, so blocks are disjoint and complete. Arithmetic-series sums compute each block exactly, and removing i=1 matches the requested lower bound.

## Complexity

There are `O(sqrt N)` quotient blocks per query, using `O(1)` extra space and 64-bit arithmetic.

## Common mistakes

- Keeping only N, primes, or prime powers rather than all divisors.
- Allowing repeated set elements.
- Counting multiples without multiplying by divisor d.
- Forgetting to subtract sigma(1).
- Using 32-bit totals.
