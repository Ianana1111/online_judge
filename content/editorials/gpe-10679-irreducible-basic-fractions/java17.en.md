Testing the gcd of every possible numerator is too slow near one billion. A numerator fails exactly when it shares one of N's prime factors. We can count the survivors using those factors instead of enumerating numerators.

For each distinct prime divisor p, exclude its multiples. Accounting for overlapping exclusions by inclusion-exclusion gives Euler's formula `φ(N) = N ∏(1−1/p)`.

Start the answer at N. On finding a divisor p, update `answer -= answer / p`, then divide every copy of p out of the remaining number. A prime power requires only one exclusion: being divisible by p² does not define an additional forbidden group beyond divisibility by p. When trial division ends, any remaining value greater than one is a final prime factor.

This computes Euler phi of n; zero is only the sentinel and is never factored.
