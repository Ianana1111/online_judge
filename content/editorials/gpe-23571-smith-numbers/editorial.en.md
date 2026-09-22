# Find the next composite with matching digit sums

## Problem and constraints

A Smith number is composite and has the same decimal digit sum as all digits of its prime factors, counted with multiplicity. Primes are explicitly excluded even though their only factor would trivially have the same digit sum. Given positive `n<10^9`, find the smallest Smith number strictly greater than `n`; existence is guaranteed.

## Building the approach

Test candidates beginning at `n+1`. Preserve the original candidate for its digit sum and factor a separate `remaining` value by trial division. For each divisor, repeatedly divide while it fits, adding that divisor's digit sum and increasing the total factor count for every occurrence.

When `divisor^2` exceeds the current remainder, any remainder greater than one is itself the final prime factor. If it were composite, it would have a smaller factor that should already have been found.

A candidate is Smith exactly when the two digit sums match and the prime-factor count is greater than one. The count condition excludes primes and one. Scanning consecutive candidates ensures the first match is the required successor.

## Walkthrough

Twenty-two factors as `2*11`. Its own digit sum is four, and the factor digits sum to `2+1+1=4`, so it is Smith. Four is `2*2`; both copies contribute and its factor count is two.

If the input itself is four, it cannot be returned because the answer must be larger. Thirteen is prime and must be rejected even though its original digit sum equals the digits of its lone prime factor.

## Why it works

Trial division removes every copy of each discovered prime factor. Once the loop ends, a remaining value above one cannot be composite without having a factor at most its square root, contradicting the stopping condition and previously completed divisions. Thus the accumulated factors are exactly the full prime factorization with multiplicity.

The sum and count tests therefore match the Smith definition precisely. Candidates are considered in strictly increasing order from `n+1`; when the first valid one is found, every smaller permitted candidate has already failed, proving minimality.

## Complexity

If `G` candidates are tested before an answer of magnitude `A`, trial division gives the conservative bound `O(G sqrt(A))`, plus small digit-sum costs. Extra space is `O(1)`.

## Common mistakes

- Accepting primes as Smith numbers.
- Counting each distinct factor only once.
- Beginning at `n` instead of `n+1`.
- Forgetting the final large prime factor.
- Adding factor values rather than their decimal digits.
