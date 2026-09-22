# Sieve divisor sums and reverse them to the largest source

## Problem and constraints

For a positive `S<=1000`, find the largest positive integer `n` whose sum of all positive divisors, including 1 and `n`, equals `S`. Print -1 when none exists. Zero terminates input.

## Building the approach

Because `n` itself is a divisor, its divisor sum is at least `n`; therefore every candidate for `S<=1000` lies within 1 through 1000. Compute all divisor sums with a sieve: for each divisor `d`, add `d` to every positive multiple.

Then scan `n` in increasing order. If its sum lies within query range, assign `largest[sum[n]]=n`. Later, larger values overwrite earlier ones sharing the same divisor sum. Initialize the reverse table to -1 for sums with no preimage.

## Walkthrough

Number 1 has divisor sum 1, so query 1 returns 1. Number 6 has sum 12, but prime 11 also has sum `1+11=12`; the answer for 12 must therefore be larger value 11. No number has divisor sum 2, so that query returns -1.

## Why it works

The sieve adds `d` to exactly its multiples, so `sum[n]` receives every and only positive divisor of `n`. The candidate bound covers every possible solution. Since the reverse-table scan is increasing, every matching `n` overwrites smaller matches and the final entry is the largest. Untouched entries correctly represent absence.

## Complexity

For `U=1000`, the sieve takes `O(U log U)` time and `O(U)` space. Each query is `O(1)`.

## Common mistakes

- Omitting `n` itself from its divisor sum.
- Keeping the first match instead of the largest.
- Rejecting `S=1` and missing `n=1`.
- Searching only primes.
- Using zero as the no-answer marker.
- Indexing the reverse table with sums above 1000.
