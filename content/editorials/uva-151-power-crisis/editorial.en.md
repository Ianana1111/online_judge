# Remove region one first, then search Josephus survivor positions

## Problem and constraints

For `13<=N<100`, region 1 is always shut down first. Counting by a fixed positive step `m` then removes remaining live regions, restarting after each removal. Find the smallest m that leaves region 13 last; zero ends input.

## Building the approach

After fixed removal of region 1, the circle contains regions 2 through N, so its size is `N-1`. Region 13 has zero-based position 11 in this reduced list.

For each candidate step from one upward, compute the Josephus survivor without simulating deletion: start `survivor=0` for size one and for sizes 2 through `N-1` update `(survivor+step)%size`. The first candidate yielding 11 is the answer.

## Walkthrough

For N=13 and step one, regions 2 through 12 disappear in order and 13 remains, so the answer is one. For N=17, the smallest valid step is seven. Target position 12 would be wrong because it forgets both removal of region 1 and zero-based indexing.

## Why it works

When expanding a Josephus circle from `size-1` to `size`, the next-round index zero corresponds to original index `step`, so survivor position maps backward by adding step modulo size. Induction reconstructs the exact final position among regions 2 through N. Position 11 is precisely region 13, and testing positive steps in order guarantees the first match is minimal.

## Complexity

If the answer is M, time is `O(MN)` and extra space is `O(1)`.

## Common mistakes

- Letting step choose the first shutdown instead of fixing region 1.
- Running recurrence through N rather than N-1.
- Using target index 12.
- Adding `step-1` in the backward map.
- Returning a valid but nonminimal step.
