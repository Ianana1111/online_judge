# Treat proper prime-factor additions as unit graph edges

## Problem and constraints

In one move, add to current value `A` one of its prime factors other than 1 and `A` itself. Find the minimum moves from `S` to `T`, or -1 if impossible. `S<=100`, `T<=1000`, and `0 0` terminates input. A prime has no legal proper prime factor.

## Building the approach

View each integer as a vertex and every legal addition `A -> A+p` as a unit-cost directed edge. BFS then finds the minimum moves. Since every factor is positive, values only increase; ignore transitions above `T`, and `S>T` naturally remains unreachable.

To list distinct prime factors, trial-divide from 2, record a divisor once, and remove all of its powers. Any remaining factor above one is prime, but include it only if it is smaller than original `A`; equality means `A` itself was prime and is forbidden. Mark distances upon enqueueing to avoid repeated states.

## Walkthrough

From 6 to 12, add factor 3 to reach 9, then add factor 3 to reach 12: two moves. Nine may add 3 but not 9. Seven is prime and cannot move to 14. A start equal to target has answer zero, while 1 cannot reach any larger value.

## Why it works

Trial division extracts every distinct prime factor, and the final remainder rule excludes exactly the whole prime number, so generated edges correspond one-to-one with legal moves. Positive edges mean no path to `T` needs a state above `T`. In an unweighted graph, BFS first assigns each vertex its shortest edge count; therefore the target's stored distance is the minimum legal moves, and -1 means no path exists.

## Complexity

At most `T` states are searched, each factored in `O(sqrt T)`, for `O(T sqrt T)` time and `O(T)` space.

## Common mistakes

- Treating 1 as a prime factor.
- Allowing a prime number to add itself.
- Allowing arbitrary composite divisors.
- Counting the initial state as a move.
- Greedily choosing the largest factor instead of searching shortest paths.
