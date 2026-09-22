# Sum every brick above the uniquely determined average height

## Problem and constraints

Redistribute bricks among `1 <= n <= 50` stacks so every stack has equal height. One move transfers one brick from one stack to another. Heights are from 1 through 100, and total height is guaranteed divisible by `n`. Find the minimum moves; `n = 0` ends input.

## Building the approach

The total number of bricks is invariant, so the only possible final height is `target = total/n`. Every stack above target must send out exactly `h-target` bricks. Sum those positive excesses.

Conservation guarantees that total excess equals total deficit. Each move can take one excess brick directly to a deficient stack, reducing both by one. Summing absolute differences would count the same moved brick once at its source and once at its destination and would require division by two.

No sorting or move-by-move simulation is necessary.

## Walkthrough

For heights `1,2,3`, the target is two; the third stack sends one brick to the first, so the answer is one. For `1,1,4`, target two leaves two excess bricks in the last stack, requiring two moves. One stack or already equal stacks have no positive excess and return zero.

## Why it works

Every overfull stack must lose all bricks above target, making total excess a lower bound on moves. Whenever excess remains, equal totals guarantee some deficit remains; moving one brick between such stacks reduces total excess by one. Repeating reaches the target in exactly the lower-bound number of moves. Therefore the summed excess is optimal.

## Complexity

Reading, summing, and checking all stacks takes `O(n)` time. Storing heights for the second pass uses `O(n)` space.

## Common mistakes

- Using the sum of absolute differences without dividing by two.
- Choosing the midpoint of minimum and maximum instead of the average.
- Forcing a move when the stacks are already equal.
- Omitting the set number, final period, or blank line.
