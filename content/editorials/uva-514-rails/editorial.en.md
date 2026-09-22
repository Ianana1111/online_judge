# Simulate the only legal stack action for each requested coach

## Problem and constraints

Coaches numbered 1 through `N` arrive in order and may enter one LIFO station track. Determine whether each target permutation can leave in its specified order. Here `N <= 1000`. A single zero ends the target list for one `N`, while `N = 0` ends all input. Print a blank line after each block of answers.

## Building the approach

Use a vector as the station stack and let `next` be the smallest coach not yet arrived. Process target coaches in order. If the wanted coach is already on top, pop it. Otherwise, the only possible action is to push arriving coaches in order until the wanted coach reaches the top or no arrivals remain.

If all coaches have arrived and the top is still different, the wanted coach is trapped below another one and the target is impossible. Read the entire permutation before simulation so that an early failure never leaves unread coaches to be mistaken for the next query.

There is no useful branching: popping a different top coach would immediately violate output order, while delaying a matching top by pushing more coaches only blocks it.

## Walkthrough

For `N=5`, target `5 4 3 2 1` is possible by pushing all five and popping them. For `3 1 2 4 5`, after outputting 3 the stack top is 2, which blocks 1, so the answer is `No`. The increasing target is possible because each coach leaves immediately after arriving.

## Why it works

When the stack top equals the next target, every valid schedule can pop it immediately; no alternative helps. When it differs, popping is illegal and the only available move is to push the next arriving coach. The simulation therefore follows a move required by every possible solution at each step. If it finishes, the produced order is the target. If it gets stuck, no different legal move existed earlier that could avoid the failure.

## Complexity

Each coach is pushed and popped at most once, giving `O(N)` time and `O(N)` stack space per target permutation.

## Common mistakes

- Treating the station as a FIFO queue.
- Removing a coach that is not at the stack top.
- Stopping input consumption after an early simulation failure.
- Reusing the stack or next-arrival counter across targets.
- Confusing the block-ending zero with the final `N = 0` sentinel.
