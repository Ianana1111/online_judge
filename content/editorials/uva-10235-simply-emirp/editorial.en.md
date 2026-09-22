# Test the original and reversed numbers in the definition's exact order

## Problem and constraints

For every integer `N` with `1 < N < 1000000`, print whether it is `not prime`, `prime`, or `emirp`. An emirp is a prime whose decimal reversal is a different prime. A palindromic prime is therefore only prime, because reversing it does not produce a different number. Input continues until end of file, and each verdict uses the required full sentence and period.

## Building the approach

Separate the definition into three checks: the original number must be prime, its reversal must be prime, and the two numbers must differ. Applying them in that order prevents a composite whose reversal happens to be prime from being misclassified, and the inequality excludes palindromic primes.

For primality, reject values below two and try every possible divisor through the square root. A composite number always has at least one factor no greater than its square root, so no larger trial divisor is needed.

To reverse the digits, repeatedly take the last digit with `% 10`, append it to `reversed` after multiplying the current result by ten, and remove the processed digit with `/= 10`. Keep the original `n` unchanged for classification and output.

## Walkthrough

`17` reverses to `71`; both are prime and different, so 17 is emirp. `19` reverses to `91=7*13`, so 19 is prime but not emirp. `11` remains 11 after reversal, so it is also only prime. Finally, `14` reverses to the prime 41, but the original is composite and must be reported as not prime.

## Why it works

If trial division finds a divisor, the number is composite. If it finds none through the square root, the number cannot have a factorization into two integers greater than one, because the smaller factor would have appeared in that range. Thus `isPrime` is correct.

At each reversal step, the processed suffix has been appended in reverse order. Repeating until no digits remain produces the exact reversed decimal integer; leading zeroes in the reversed writing correctly disappear from its numeric value. The final branches are mutually exclusive and cover composite originals, distinct prime reversals, and all remaining primes, exactly matching the three required classifications.

## Complexity

Each primality test takes `O(sqrt(N))` time, digit reversal takes `O(log N)`, and the algorithm uses `O(1)` extra space. Under the one-million bound, at most about one thousand trial divisors are considered per test.

## Common mistakes

- Calling every prime with a prime reversal an emirp, including palindromes.
- Testing only the reversed number and forgetting that the original must be prime.
- Using `<` instead of `<=` at the square-root boundary and accepting perfect squares such as 49.
- Destroying `n` while reversing it and then printing the wrong value.
- Omitting the required wording or final period.
