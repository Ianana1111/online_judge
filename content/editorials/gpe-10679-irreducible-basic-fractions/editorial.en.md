# Exclude multiples of each distinct prime factor once

## Problem and constraints

For a positive denominator N < 10⁹, count numerators from zero through N − 1 that are coprime to N. These give the irreducible basic fractions. An input zero terminates processing. At N = 1, the only candidate is 0/1 and gcd(0,1) = 1, so the answer is one.

## Building the approach

Testing the gcd of every possible numerator is too slow near one billion. A numerator fails exactly when it shares one of N's prime factors. We can count the survivors using those factors instead of enumerating numerators.

For each distinct prime divisor p, exclude its multiples. Accounting for overlapping exclusions by inclusion-exclusion gives Euler's formula `φ(N) = N ∏(1−1/p)`.

Start the answer at N. On finding a divisor p, update `answer -= answer / p`, then divide every copy of p out of the remaining number. A prime power requires only one exclusion: being divisible by p² does not define an additional forbidden group beyond divisibility by p. When trial division ends, any remaining value greater than one is a final prime factor.

## Walkthrough

For N = 12, the distinct factors are two and three. The answer becomes `12 × 1/2 × 2/3 = 4`, corresponding to numerators 1, 5, 7, and 11. For N = 8, factor two is processed once, giving four. For prime N = 13, every nonzero numerator works, giving twelve.

## Why it works

Coprimality means avoiding multiples of every distinct prime factor of N. Inclusion-exclusion over these factors expands exactly into the product formula because every selected factor product divides N. The algorithm applies each factor once and includes the possible final prime remainder, so it evaluates that formula exactly. For N = 1, the empty product leaves the required answer one.

## Complexity

O(√N) worst-case trial division and O(1) extra space. Removing factors reduces the remaining search bound. All updates use exact integer arithmetic.

## Common mistakes

- Applying the factor correction repeatedly for a prime power.
- Forgetting the final prime remainder.
- Excluding numerator zero even for N = 1.
- Enumerating nearly N gcd computations.
- Using floating-point product factors and rounding afterward.
