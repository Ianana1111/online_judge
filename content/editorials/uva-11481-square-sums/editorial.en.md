# Choose the required fixed points, then exclude extra ones

## Problem and constraints

Permute `1..N` so that exactly `K` of the first `M` positions contain their original values. Fixed points after position `M` are unrestricted. `N<=1000`, with `0<=K<=M<=N`, and answers are modulo 1,000,000,007.

## Building the approach

First choose which `K` of the first `M` positions are fixed, in `C(M,K)` ways. After fixing them, `N-K` values remain, but the other `M-K` early positions must not become fixed. Treat each such unwanted fixed point as a bad event and use inclusion-exclusion.

If a chosen set of `j` bad positions is also forced fixed, choose it in `C(M-K,j)` ways and freely permute the other `N-K-j` values, giving `(N-K-j)!`. Thus the count for one chosen required set is

`sum (-1)^j C(M-K,j) (N-K-j)!`.

Multiply by `C(M,K)`. Precomputed factorials and modular inverse factorials make each combination constant time.

## Walkthrough

For `N=5,M=3,K=2`, choose the two required fixed positions in three ways. Among the remaining three values, one early position is forbidden from being fixed, so inclusion-exclusion gives `3!-2!=4`. The total is 12. If `M=K`, there are no forbidden early positions and only the `j=0` term remains. If `M=0`, all `N!` permutations qualify.

## Why it works

Every valid permutation has one unique set of `K` fixed points among the first `M`, so the outer choice neither omits nor duplicates a permutation. Once that set is fixed, the remaining restrictions are exactly the `M-K` bad events. Inclusion-exclusion adds intersections of even size and subtracts intersections of odd size. Any intersection of `j` events fixes `K+j` positions and leaves `(N-K-j)!` bijections. Summing all equal-sized intersections removes precisely every extra early fixed point while placing no restriction on later positions.

## Complexity

Factorial preprocessing uses `O(N)` time and space plus `O(log MOD)` for one modular exponentiation. Each case takes `O(M-K+1)` time.

## Common mistakes

- Choosing `K` points and freely permuting the rest, which counts at least `K`.
- Forbidding fixed points in all `N` positions instead of only the first `M`.
- Omitting the outer factor `C(M,K)`.
- Using ordinary division under a modulus.
- Leaving a negative inclusion-exclusion remainder unnormalized.
