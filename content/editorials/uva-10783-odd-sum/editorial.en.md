# Use the square formula for prefixes of positive odd numbers

## Problem and constraints

For each inclusive interval `[a,b]`, sum all odd integers it contains. `0<=a<=b<=100`. Zero is not odd, an interval with no odd number has sum zero, and every result is printed with its case number.

## Building the approach

There are `floor((n+1)/2)` positive odd numbers no greater than `n`. The first `k` positive odd numbers

`1,3,5,...,2k-1`

sum to `k^2`. Define `F(n)` using this count and square. The closed interval result is

`F(b)-F(a-1)`.

The second prefix removes exactly the odds strictly before `a`. For `a=0`, the function receives `-1`; `(bound+1)/2` is zero in this actual case, producing the correct empty prefix.

## Walkthrough

For `[1,5]`, there are three prefix odds, so the sum is `3^2-0^2=9`. For `[3,5]`, subtracting the prefix through two gives `3^2-1^2=8`.

For `[2,2]`, both relevant prefixes equal one, so the result is zero. For `[1,1]`, the single included odd endpoint yields one.

## Why it works

The sum of the first k odd numbers is

`sum(2i-1) = 2*k(k+1)/2-k = k^2`.

Thus `F(n)` exactly sums all positive odds no greater than n. Removing all odds at most `a-1` from those at most `b` leaves exactly the odd values in the inclusive interval, proving the formula.

## Complexity

Each case takes `O(1)` time and `O(1)` extra space.

## Common mistakes

- Subtracting `F(a)` and excluding an odd left endpoint.
- Using `F(b-1)` and excluding an odd right endpoint.
- Treating zero as an odd number.
- Printing the count of odd values rather than their sum.
- Returning zero whenever endpoints are equal, even for a single odd value.
