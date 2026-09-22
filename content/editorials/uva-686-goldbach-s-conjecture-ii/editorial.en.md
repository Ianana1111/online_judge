# Count each unordered prime pair through its smaller endpoint

## Problem and constraints

For every even `N` with `4 <= N < 32768`, count distinct unordered ways to write `N` as the sum of two primes. Swapping addends does not create a new way, and equal primes are allowed. Input ends with zero. Because four is legal, pair `2+2` must be included.

## Building the approach

Precompute all primes below 32768 with a sieve. Enumerate the smaller endpoint `p` from 2 through `floor(N/2)`; its partner is uniquely `N-p`. Increment when both table entries are prime.

Every unordered pair has exactly one representation with `p <= N-p`, so restricting the first endpoint removes duplicates without a set. The inclusive midpoint retains equal-prime pairs. Enumerating all the way to `N-2` and dividing by two is unsafe because a diagonal pair appears only once and would be halved incorrectly.

## Walkthrough

For 10, the pairs are `3+7` and `5+5`, giving two; `7+3` is the first pair in reverse and is not counted again. Four has only `2+2`, giving one. For 26, valid pairs include `3+23`, `7+19`, and `13+13`, again showing why the midpoint matters.

## Why it works

Every legal unordered pair can be written uniquely as `p <= q`. Since `p+q=N`, this implies `p <= N/2`, so the loop reaches its smaller endpoint. Prime-table checks admit exactly pairs whose two endpoints are prime and sum to `N`. Each loop value determines one partner and no reversed endpoint enters the range as a second representation, proving complete counting without duplication.

## Complexity

For `B=32768`, sieving takes `O(B log log B)` time and `O(B)` space. Each query scans `O(N)` candidates with `O(1)` extra space.

## Common mistakes

- Counting both `p+q` and `q+p`.
- Using `p < N/2` and dropping equal-prime pairs.
- Starting at three and losing `2+2` for four.
- Stopping after the first pair.
- Leaving zero or one marked prime.
