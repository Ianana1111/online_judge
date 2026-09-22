# Reduce Stirling parity to a carry-free binary addition

## Problem and constraints

The Stirling number of the second kind `S(n,m)` counts partitions of `n` distinct elements into `m` nonempty unlabeled sets. We only need its parity for `1 <= m <= n <= 10^9`. Computing either the full enormous integer or an `n` by `m` recurrence table is impossible. A blank line is required between consecutive outputs.

## Building the approach

The large bound and parity-only output suggest working modulo 2. Let `d = n - m` and fix `m`. The ordinary generating function is

`sum S(m+d,m) x^d = product_{j=1..m} (1-jx)^(-1)`.

Modulo 2, every even `j` contributes the factor 1, while every odd `j` contributes `(1-x)^(-1)`. There are `c = ceil(m/2)` odd values, so the coefficient becomes

`C(d+c-1, c-1)`.

A binomial coefficient `C(a+b,b)` is odd exactly when adding `a` and `b` in binary creates no carries. Equivalently, `(a & b) == 0`. Substituting `a=d` and `b=c-1=floor((m-1)/2)` gives a constant-time bit test.

## Walkthrough

`S(4,2)=7` is odd. Here `d=2` and `(m-1)/2=0`, so their bitwise AND is zero and the answer is 1. For `S(4,3)=6`, both values are 1; the low bits overlap, so a carry occurs and the answer is 0. When `m=1` or `m=n`, the formula naturally reports the single possible partition as odd.

## Why it works

Applying the Stirling recurrence at fixed `n-m` gives the stated product generating function. Reducing each factor modulo 2 removes even indices and merges all odd indices into `c` identical factors. The negative-binomial expansion then makes the desired coefficient `C(d+c-1,c-1)`.

By Lucas's theorem modulo 2, a binomial coefficient is odd precisely when every 1-bit selected by its lower argument is also present in its upper argument. For the form `C(a+b,b)`, that is exactly the condition that `a+b` has no binary carry, or `a & b == 0`. The implemented test is therefore equivalent to the original Stirling parity.

## Complexity

Each case uses a constant number of integer and bit operations, so time and extra space are `O(1)` on fixed-width integers.

## Common mistakes

- Computing full Stirling numbers and overflowing.
- Building an `O(nm)` table despite the billion-size bound.
- Using `m/2` instead of `(m-1)/2`.
- Testing bits of `n` instead of `n-m`.
- Omitting the blank line required between outputs.
