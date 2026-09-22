# Compare distance with the capacities of odd and even step mountains

## Problem and constraints

Move from integer `x` to `y`, with `0 <= x <= y < 2^31`. A nonempty journey begins and ends with step length one, and adjacent step lengths differ by at most one; intermediate lengths may be nonnegative. Find the minimum number of steps. When `x=y`, the empty journey takes zero steps.

## Building the approach

For a fixed step count, maximum distance forms a mountain rising from one toward the center and falling to one. With `2k-1` steps, its maximum is

`1+2+...+k+...+2+1 = k^2`.

With `2k` steps, duplicating the peak gives maximum `k(k+1)`. Let `k=floor(sqrt(d))` for `d=y-x`. If `d=k^2`, answer `2k-1`; if `k^2 < d <= k^2+k`, answer `2k`; otherwise answer `2k+1`. Handle zero first.

Obtain a square-root estimate and correct it using integer squares so values exactly at boundaries cannot be misclassified by floating rounding.

## Walkthrough

Distance 9 uses `1,2,3,2,1`, five steps. Distance 10 can use six steps, and distance 12 reaches the even-step maximum `1,2,3,3,2,1`. Distance 13 exceeds that capacity and needs seven. Translating both endpoints leaves the same distance and answer.

## Why it works

At position `i`, adjacency limits its step by both its distance from the first and last unit steps; their minimum produces the mountain and is an upper bound for any sequence. The stated mountains attain `k^2` and `k(k+1)`. Distances between these thresholds can be attained by inserting or lowering an appropriate central step without breaking adjacent differences. Each selected branch is achievable, while one fewer step has maximum capacity below `d`, proving minimality.

## Complexity

Each case uses `O(1)` time and space. `long long` safely holds boundary square calculations.

## Common mistakes

- Applying `2k-1` to zero distance and returning -1.
- Giving a perfect square `2k` steps.
- Excluding equality at `k^2+k`.
- Trusting a floating square root without integer correction.
- Depending on absolute endpoint positions instead of their difference.
