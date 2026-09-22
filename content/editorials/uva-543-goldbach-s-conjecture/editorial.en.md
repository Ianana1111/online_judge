# Search the smallest prime partner to maximize the difference

## Problem and constraints

For each even `N` with `6 <= N < 1000000`, find odd primes `a` and `b` such that `N = a+b` and `b-a` is maximum. Equal primes are allowed. Input ends with zero, and a fixed failure sentence is required if no pair exists; the program must test rather than assume the conjecture.

## Building the approach

Precompute primality below one million with the Sieve of Eratosthenes. For fixed `N`, choosing the smaller endpoint `a` determines `b = N-a`, and the difference becomes `N-2a`. It strictly decreases as `a` grows, so the first valid pair found from the smallest odd prime has maximum difference.

Test `a = 3,5,7,...` through `N/2`. The inclusive endpoint allows equal primes. For each candidate, constant-time table lookups verify both endpoints. Mark zero and one nonprime explicitly so `1 + (N-1)` cannot become a false maximum-gap result.

## Walkthrough

For 20, valid pairs include `3+17` and `7+13`; their gaps are 14 and 6, so the first wins. For 12, `3+9` fails primality and `5+7` succeeds. For 6, the loop must include `a=3`, producing the equal pair `3+3`.

## Why it works

The sieve marks every composite through one of its prime factors no larger than its square root and never marks a prime, so table answers are exact. The search enumerates every possible smaller odd endpoint in increasing order. Since `N-2a` decreases with `a`, its first valid pair has the largest difference. If none exists through `N/2`, any unordered pair would require a smaller endpoint in that tested range, so failure is correct.

## Complexity

For limit `B = 1000000`, sieving takes `O(B log log B)` time and `O(B)` space once. Each query takes at most `O(N)` simple table checks.

## Common mistakes

- Searching near `N/2` and minimizing rather than maximizing the gap.
- Treating 1 as prime.
- Forbidding equal primes and losing the case 6.
- Continuing after a match and overwriting the optimal smallest endpoint.
- Allocating only `N` table entries and indexing one past the end.
