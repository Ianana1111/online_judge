# Count prime powers in a factorial with Legendre's formula

## Problem and constraints

For each `2<=N<=100`, print in increasing prime order the exponents in the factorization of `N!`. Do not print prime values. Zero ends input. Output uses width-three fields, at most 15 exponents per line, and six leading spaces on continuation lines.

## Building the approach

For a prime p, every multiple of p contributes at least one factor, every multiple of `p^2` contributes one additional factor, and so on. The exponent is therefore `floor(N/p)+floor(N/p^2)+...`.

Sieve all primes through 100. For each p no larger than N, start `quotient=N/p`, repeatedly add it and divide it by p until zero. This avoids both constructing `N!` and explicitly multiplying prime powers. Track printed columns and wrap before the sixteenth value.

## Walkthrough

`5!=2^3*3*5`, so its exponents are 3,1,1. In `10!`, the exponent of two is `5+2+1=8`, not merely the five even numbers. `100!` has 25 prime factors, requiring 15 fields on the first line and 10 on the second.

## Why it works

If an integer contains p to exponent e, it is counted once among multiples of each of p through `p^e`, exactly e times. Summing these layers across integers 1 through N equals p's factorial exponent. Every possible prime factor is at most N, and the sieve enumerates all of them in order, so the output is complete and exact.

## Complexity

The fixed sieve costs `O(B log log B)` for `B=100`. A query performs `O(log_p N)` divisions per prime and uses constant working space.

## Common mistakes

- Counting only multiples of p and missing higher powers.
- Printing zero exponents for primes above N.
- Wrapping before or after the wrong column.
- Ignoring width-three and continuation indentation.
- Constructing `N!` in a fixed-width integer.
