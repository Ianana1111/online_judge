# Check original order and uniqueness of every i-less-than-or-equal-j sum

## Problem and constraints

A B2 sequence contains positive integers in strictly increasing original order, and every sum `b_i+b_j` for `i<=j` is distinct. Cases contain 2 through 100 values and continue to EOF. The original sequence must be judged as given; sorting or deduplicating it first is invalid.

## Building the approach

First scan values for positivity and strict increase. Then enumerate exactly all unordered index pairs with repetition: i from zero to N-1 and j from i to N-1. Insert each sum into a set. A failed insertion means another distinct index pair already produced that sum.

Starting j at i includes required self-pairs such as `b_i+b_i`. Starting earlier would also enumerate symmetric `(j,i)` and falsely flag every normal off-diagonal pair as duplicate.

Read the whole sequence before validation so a failure never leaves input misaligned.

## Walkthrough

`1,2,4` produces sums 2,3,5,4,6,8, all distinct. `1,2,3` fails because `1+3=2+2=4`.

`4,1` fails original ordering even if its sums were unique, and `0,1` fails positivity.

## Why it works

The first scan directly tests the positive strictly increasing requirements. The nested loops enumerate every and only pair with `i<=j`, including diagonal pairs once and symmetric pairs only once.

Set insertion succeeds exactly for a previously unseen sum. Therefore all insertions succeeding is equivalent to pairwise uniqueness. Both stages being true is necessary and sufficient for the definition.

## Complexity

There are `N(N+1)/2` pairs. Ordered-set insertion gives `O(N^2 log N)` time and `O(N^2)` space.

## Common mistakes

- Omitting `i=j` pairs.
- Enumerating both pair orders and manufacturing duplicates.
- Sorting the input before checking order.
- Allowing equal consecutive values.
- Omitting the blank line after each case.
