# Sieve once and locate the neighboring primes by binary search

## Problem and constraints

For `2<=k<=1299709`, print zero if k is prime. Otherwise print the difference between the adjacent primes immediately below and above k. Gap length is endpoint difference, not the number of interior composites. Zero ends input, and the upper bound is itself the 100,000th prime.

## Building the approach

Use the Sieve of Eratosthenes through the inclusive upper bound and collect every prime in increasing order. For a query, `lower_bound` finds the first prime at least k. If it equals k, print zero; otherwise it is the upper endpoint and its predecessor is the lower endpoint.

The constraints guarantee a composite query is above two and every query has a found upper prime, so predecessor and dereference are safe in their respective branches.

## Walkthrough

For k=27, neighboring primes are 23 and 29, producing gap 6. For prime 11, the answer is zero rather than distance to 13. For 4, primes 3 and 5 give gap 2 even though only one composite lies inside.

## Why it works

The sieve marks exactly composite multiples, so the collected ordered array contains every prime in range. `lower_bound` returns the least prime no smaller than k. On a non-equal composite query, its predecessor is the greatest prime below k, and completeness of the array means no prime lies between these endpoints. Their difference is exactly the unique containing gap.

## Complexity

For upper bound U, preprocessing takes `O(U log log U)` time and `O(U)` space. Each query takes `O(log P)` for P primes.

## Common mistakes

- Subtracting one from the endpoint difference.
- Returning a neighboring distance for a prime.
- Excluding the inclusive upper bound from the sieve.
- Treating zero or one as prime.
- Searching the zero sentinel.
