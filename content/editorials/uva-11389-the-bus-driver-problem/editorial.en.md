# Pair short morning routes with long evening routes

## Problem and constraints

Each of `N` drivers receives one morning route and one evening route, using every route exactly once. When a driver's combined distance exceeds `D`, each excess unit costs `R`. We need the minimum total overtime cost. `N<=100`; a `0 0 0` line terminates input.

## Building the approach

Unused regular time for one driver cannot cancel another driver's overtime, so costs must be computed after forming pairs. Sort morning routes ascending and evening routes descending, then pair equal indices. Long work from one side is balanced with short work from the other.

For each pair, add `max(0, morning+evening-D) * R`. Do not simply subtract `N*D` from the sum of all routes because the positive-part operation applies separately to each driver.

## Walkthrough

Morning `10,15`, evening `10,15`, `D=20`, and `R=5` become pairs 10+15 and 15+10. Each exceeds the limit by 5, for total cost 50. With morning `1,10`, evening `1,10`, and `D=11`, opposite pairing makes both totals 11 and costs zero; same-direction pairing would create totals 2 and 20.

## Why it works

Let `f(s)=max(0,s-D)`. For `a<=b` and `c<=d`, same-direction pairs `a+c` and `b+d` are more unequal than crossed pairs `a+d` and `b+c`, while preserving their total. Moving load from the larger sum to the smaller cannot increase the sum of this nondecreasing convex overtime function. Thus replacing a same-direction pair by a crossed one never worsens cost. Repeated exchanges eliminate all such inversions and yield ascending morning routes paired with descending evening routes, proving optimality.

## Complexity

The two sorts take `O(N log N)` time; pairing takes `O(N)`. Storage is `O(N)`.

## Common mistakes

- Sorting both arrays in the same direction.
- Pooling all unused regular time before calculating overtime.
- Forgetting to multiply excess distance by `R`.
- Allowing a negative excess to reduce the answer.
- Reusing or omitting a route.
