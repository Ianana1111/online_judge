# Count stair-climbing plans from the final step

## Problem and constraints

A staircase has `n` steps. Each move climbs one or two steps, and different move orders count as different plans. Input contains positive values `n<=100` until EOF. The exact integer answer is required; there is no modulus. Near 100 steps, the count exceeds 64-bit range.

## Building the approach

Classify every plan by its last move. If the final move has length one, the preceding moves form any plan to step `k-1`. If it has length two, they form any plan to step `k-2`. The two classes are disjoint and cover all plans, giving

`ways[k] = ways[k-1] + ways[k-2]`.

Set `ways[0]=1` for the empty plan and `ways[1]=1`. The zero-step state is an internal base case that makes `ways[2]=2` naturally; zero need not be a legal input.

Only the previous two states are needed. Roll them through two variables. For `n<=100`, the maximum answer fits the available `unsigned __int128`, then must be converted manually to decimal because standard streams do not directly print that extension type.

## Walkthrough

For `n=4`, the five plans are `1+1+1+1`, `1+1+2`, `1+2+1`, `2+1+1`, and `2+2`. The states are 1, 1, 2, 3, 5 from steps zero through four.

Counting only how many one-steps and two-steps occur would merge different orders and undercount the valid plans.

## Why it works

The base cases are correct. For every `k>=2`, removing the last move creates a one-to-one correspondence from plans ending in one step to plans for `k-1`, and from plans ending in two steps to plans for `k-2`. No plan belongs to both classes. Their counts therefore sum to exactly `ways[k]`.

The rolling variables retain these two preceding values at every iteration, so when the loop finishes, `current` equals the required count for `n`.

## Complexity

Each case uses `O(n)` fixed-width additions and `O(1)` calculation space. Decimal conversion takes `O(D)` time and output space for `D` digits; here `D` is at most 21.

## Common mistakes

- Storing the answer in `long long` or `unsigned long long`.
- Returning Fibonacci(`n`) rather than Fibonacci(`n+1`).
- Using exponential recursion without memoization.
- Sending `__int128` directly to `cout`.
- Reading only one value instead of continuing to EOF.
