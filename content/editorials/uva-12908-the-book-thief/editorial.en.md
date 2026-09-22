# Find the first triangular sum strictly above the observed total

## Problem and constraints

A book numbers pages 1 through `N`, but exactly one positive page number is omitted when summing them, producing `s` with `1<=s<=10^8`. Print the missing page followed by `N`; zero terminates input. The missing page cannot be zero.

## Building the approach

The complete sum is `T(N)=N(N+1)/2`, and the missing page is `T(N)-s`. Requiring it between 1 and N is equivalent to `T(N-1)<=s<T(N)`. Thus `N` is the first index whose triangular number is strictly greater than `s`.

Binary-search this monotone condition in a range ending at 20,000, whose triangular value exceeds the maximum input. Then subtract `s` from the found complete sum.

## Walkthrough

For `s=9000`, `T(133)=8911` and `T(134)=9045`, so the book has 134 pages and page 45 is missing. For `s=6=T(3)`, choosing three would imply missing page zero; the next value `T(4)=10` gives missing page four.

## Why it works

Every legal solution satisfies exactly the adjacent-triangular inequality above, and these intervals are disjoint and cover all possible sums. Binary search returns the unique first strict upper triangular number. Its difference from `s` consequently lies from one through `N` and is the unique missing page.

## Complexity

Each query takes `O(log 20000)` time and `O(1)` space, using 64-bit integer arithmetic throughout.

## Common mistakes

- Searching for `T(N)>=s` and allowing missing page zero.
- Trusting an uncorrected floating-point square root.
- Printing total pages before the missing page.
- Using the observed sum as if no page were omitted.
