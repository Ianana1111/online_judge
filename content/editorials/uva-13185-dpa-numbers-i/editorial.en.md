# Sum every proper divisor directly and compare with the number

## Problem and constraints

For each `2<=n<=1000`, sum its positive proper divisors, which exclude `n` itself. Print `deficient` when the sum is smaller, `perfect` when equal, and `abundant` when larger. There are at most 500 cases and output uses lowercase words without labels.

## Building the approach

The small bound permits direct enumeration from 1 through `n-1`. Add `d` exactly when `n%d==0`, then compare the completed sum with `n` using the three mutually exclusive relations.

Starting from the definition avoids unnecessary prime special cases: one is always included for legal `n`, while `n` itself is excluded by the loop bound.

## Walkthrough

For 8, proper divisors 1,2,4 sum to 7, so it is deficient. For 6, 1+2+3 equals 6 and it is perfect. For 12, divisors 1,2,3,4,6 sum to 16, so it is abundant. Prime 2 has only divisor 1 and is deficient.

## Why it works

The loop visits every positive integer smaller than `n` exactly once and includes it exactly when it divides `n`. Its sum is therefore precisely the proper-divisor sum. Integer comparison has exactly the three cases represented by the output branches, so the resulting classification matches the definition.

## Complexity

Each case uses `O(n)` time and `O(1)` extra space, easily within the bound.

## Common mistakes

- Iterating through `d<=n` and including the number itself.
- Omitting divisor one.
- Classifying equality as deficient.
- Printing uppercase words or case numbers.
- Reusing the previous case's sum.
