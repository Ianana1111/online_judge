# Run Dijkstra on jug states weighted by poured volume

## Problem and constraints

Three jugs have capacities `a,b,c`. Initially the first two are empty and the third is full. A move pours from one jug into another until the source empties or the destination fills; stopping early is forbidden. Obtain target volume `d` with minimum total volume poured. If `d` is impossible, first maximize an attainable volume below `d`, then minimize cost for that volume. Capacities and target are at most 200, and using no move is allowed.

## Building the approach

View every water distribution as a graph state and every legal pour as an edge. Edge cost is the number of liters moved, so different moves have different weights and ordinary BFS would minimize the wrong quantity.

Total water remains `c`. Store only amounts `(x,y)` in the first two jugs; the third is `c-x-y`. For each state, enumerate the six ordered source-destination pairs. The forced pour amount is

`min(source amount, destination capacity - destination amount)`.

Use it both to create the next state and as the nonnegative edge weight. Dijkstra from `(0,0)` finds minimum cost to every reachable distribution.

Whenever a state is finalized, update the best cost for each of its three present volumes. Finally scan downward from `d`; the first attainable volume implements the primary closest-below objective, and its stored cost implements the secondary minimum-pouring objective.

## Walkthrough

With capacities `2,3,4` and target two, pour two liters directly from the third jug into the first. The target is reached at cost two.

If all capacities are one and the target is 200, the largest attainable volume not exceeding it is one. The third jug already contains one initially, so the correct output has cost zero and volume one.

## Why it works

Every permitted operation is uniquely determined by its ordered source and destination and must move exactly the enumerated forced amount. Thus the state graph contains all legal operations and no illegal partial pours. Conservation proves that two stored jug amounts determine the entire state.

All edge weights are nonnegative, so Dijkstra gives the least total poured volume for every reachable distribution. Any way to obtain volume `v` ends in a state containing `v`, and the minimum over all such finalized state costs is exactly the best cost for `v`. Scanning `v` downward from the target follows the required priority: greatest attainable volume first, then its minimum cost.

## Complexity

There are at most `(a+1)(b+1)` states and six outgoing moves each. Time is `O(ab log(ab))` and distance storage is `O(ab)`.

## Common mistakes

- Using BFS and minimizing the number of pours instead of liters moved.
- Allowing an arbitrary partial pour.
- Checking only the third jug for the target.
- Choosing the cheapest fallback volume instead of the greatest attainable one below the target.
- Forgetting that the initial state can already provide a zero-cost answer.
