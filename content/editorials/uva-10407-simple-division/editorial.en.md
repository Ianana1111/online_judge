# Eliminate the unknown remainder by taking differences

## Problem and constraints

Each data line contains between two and one thousand nonzero integers followed by a terminating zero. The integers are not all equal. Find the greatest positive integer `d` such that every data value leaves the same nonnegative remainder when divided by `d`. A line containing only zero terminates all input. Values may be negative, and the statement gives no tight magnitude bound.

## Building the approach

Do not try to guess the shared remainder. If

`ai = qi*d+r` and `a0 = q0*d+r`,

then subtracting gives `ai-a0=(qi-q0)*d`. Thus a valid `d` must divide every difference from one fixed reference value. Conversely, any positive divisor of all those differences makes every value congruent to the reference and therefore gives the same remainder.

The largest common divisor of all absolute differences is exactly the answer. Start the accumulator at zero and repeatedly take `gcd(answer, abs(value-first))`; `gcd(0,x)=x` naturally ignores repeated values whose difference is zero. The promise that values are not all equal ensures the final gcd is positive.

## Walkthrough

For `-5,1,7`, the differences from `-5` are six and twelve. Their gcd is six, and all three values have nonnegative remainder one modulo six.

For `10,10,22`, the differences are zero and twelve. The zero difference imposes no additional restriction, so the answer remains twelve rather than becoming zero.

## Why it works

If `d` gives the same remainder for every value, it divides every `ai-a0`, so it is a common divisor of the computed differences and cannot exceed their gcd.

The gcd itself divides every difference, meaning each `ai` is congruent to `a0` modulo that gcd. It is therefore a valid divisor. Since it is both feasible and at least as large as every feasible `d`, it is the greatest answer.

## Complexity

For `N` numbers and maximum absolute difference `V`, Euclid's algorithm gives `O(N log V)` arithmetic steps and the stored input line uses `O(N)` space. Python integers remain exact for unbounded stated magnitudes.

## Common mistakes

- Taking the gcd of the original values and assuming the common remainder is zero.
- Including the line's terminating zero as data.
- Treating a repeated value as an impossible case.
- Keeping signed differences and printing a negative divisor.
- Ending all input at every trailing zero instead of only a line containing zero alone.
