# Factor the ordered first-component sum, then repair the diagonal

## Problem and constraints

Given the prime factorization of a positive integer `n`, sum `p+q` over all `1<=p<=q<=n` with `lcm(p,q)=n`, modulo 1,000,000,007. There are at most 15 distinct primes, each exponent is at most 50, and `n` itself may be far too large to construct or enumerate.

## Building the approach

Consider all ordered valid pairs and sum only their first component; call this `A`. For every unequal unordered pair, its two orders contribute `p+q` to `A`. The only equal pair is `(n,n)`, for which `A` contributes only `n` instead of `2n`, so the requested answer is `A+n`.

For a prime power `r^a`, exponent choices `i,j` must satisfy `max(i,j)=a`. If `i<a`, then `j` must be `a`, contributing `r^i` once. If `i=a`, then `j` has `a+1` choices, contributing `(a+1)r^a`. Thus this prime's factor is `1+r+...+r^(a-1)+(a+1)r^a`. Multiply these independent factors to obtain `A`, while separately multiplying `r^a` to obtain `n` modulo the modulus.

## Walkthrough

For `n=6=2*3`, the local factors are `1+2*2=5` and `1+2*3=7`, so `A=35`. Adding `n=6` gives 41. For prime `n=5`, `A=1+2*5=11`; adding five gives 16, matching `(1,5)` contributing 6 and `(5,5)` contributing 10.

## Why it works

The LCM condition is equivalent to the maximum exponent condition independently for every prime. Cartesian-product choices and distributivity therefore factor the sum of the first component into the product of the local weighted sums above. Paired orders of every unequal pair already provide its full `p+q`, while the sole diagonal `(n,n)` needs exactly one additional `n`. Modular addition and multiplication preserve the result.

## Complexity

Each case takes `O(sum a_i)` time and `O(1)` auxiliary space. Values are reduced modulo the modulus throughout, and no modular division is needed.

## Common mistakes

- Dividing an ordered sum by two without handling the diagonal.
- Forgetting the final additional `n`.
- Giving `q` only one choice when `p` already has exponent `a`.
- Constructing the enormous exact value of `n`.
- Adding independent prime contributions instead of multiplying them.
