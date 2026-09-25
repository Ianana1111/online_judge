Precompute all primes below 32768 with a sieve. Enumerate the smaller endpoint `p` from 2 through `floor(N/2)`; its partner is uniquely `N-p`. Increment when both table entries are prime.

Every unordered pair has exactly one representation with `p <= N-p`, so restricting the first endpoint removes duplicates without a set. The inclusive midpoint retains equal-prime pairs. Enumerating all the way to `N-2` and dividing by two is unsafe because a diagonal pair appears only once and would be halved incorrectly.

Because input may contain thousands of queries, Python first enumerates all prime pairs p ≤ q into `answers[p+q]`. Each query then becomes a table lookup. Equal-prime pairs are included.
