# Reach the target when the triangular sum has matching parity

## Problem and constraints

Assign a plus or minus sign to every number `1,2,...,N` so their signed sum equals `k`. Find the minimum `N>=1`. The absolute target is at most one billion, zero is allowed, and output cases are separated by a blank line. `N=0` is not a valid empty solution.

## Building the approach

If every sign is positive, the sum is `S=N(N+1)/2`. Flipping number `x` from positive to negative changes the sum by `2x`, not `x`. To reach `|k|`, it is necessary that `S>=|k|` and `S-|k|` be even.

These conditions are also sufficient because numbers 1 through N can form every subset sum from zero through S. Select a subset totaling `(S-|k|)/2` and flip exactly those signs.

Negative and positive targets have equal minimum length: negating every sign changes one into the other. Starting at `N=1`, accumulate the triangular sum until both magnitude and parity conditions hold. The zero target reaches `N=3`, represented by `1+2-3=0`.

## Walkthrough

For `k=12`, `N=5` has sum 15 with odd difference, and `N=6` has sum 21 with odd difference. At `N=7`, sum 28 differs by 16, so flip a subset totaling eight, such as `{1,7}`, to obtain 12.

For zero, neither one nor two can cancel completely; three is the first valid length.

## Why it works

Any signed result has magnitude at most S and differs from S by twice the sum of flipped elements, proving necessity. For sufficiency, the consecutive numbers 1 through N form every subset sum from zero to S: inductively, previous sums cover an initial interval and adding N covers the following interval without a gap.

Thus the even half-difference can always be selected. The algorithm tests N in increasing order and stops at the first value satisfying these necessary and sufficient conditions, proving minimality.

## Complexity

Since triangular sums grow quadratically, time is `O(sqrt(|k|)+1)` and extra space is `O(1)`.

## Common mistakes

- Checking only that the triangular sum reaches the target.
- Returning zero for target zero.
- Failing to take the absolute value of a negative target.
- Treating target sign as a fixed sign for the first number.
