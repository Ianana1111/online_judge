# Stop Kruskal when the outposts form exactly enough satellite groups

## Problem and constraints

There are `P` outposts and `S` satellite channels, with `1 <= S < P <= 500`. Outposts in the same group communicate through radio links, while satellite channels connect the groups. Partition all outposts into at most `S` connected groups while minimizing the largest radio distance required inside any group. Print that distance to two decimal places.

## Building the approach

Imagine proposing a maximum radio range `D`. Keep every pair of outposts whose Euclidean distance is at most `D`. The range is feasible exactly when this graph has at most `S` connected components, since one satellite channel can serve each component.

Kruskal processes all pair distances from smallest to largest, which reveals the first range at which the component count falls from `P` to `S`. Start with every outpost separate and union endpoints of increasing edges. Each successful union reduces the count by one, so after `P-S` unions the current edge length is the minimum feasible threshold.

Store squared Euclidean distances. Square root is increasing, so their order is identical to the true-distance order, and all comparisons remain exact integers. Take one square root only for the final answer. Equivalently, this constructs an MST and removes its `S-1` largest edges.

## Walkthrough

With two channels and four outposts, suppose one edge of length 200 joins the first pair and one of about 212.132 joins the second pair. After two successful unions, two groups remain. The satellite channels connect those groups, so the longer radio link needed is 212.132 and the output is `212.13`. A length-300 edge between the groups is unnecessary.

## Why it works

For any threshold `D`, more than `S` connected components cannot all receive their own satellite channel, so that threshold is infeasible. If there are at most `S` components, assigning a channel to each component makes the threshold feasible.

Kruskal considers edges in nondecreasing order and performs every union needed at each threshold. Thus after an edge is processed, its DSU components equal the components obtainable with edges no longer than that edge. The edge that performs union `P-S` is exactly the first threshold leaving `S` components, which the feasibility argument proves is optimal.

## Complexity

The complete graph has `O(P^2)` edges. Building it takes `O(P^2)`, sorting takes `O(P^2 log P)`, and DSU operations take `O(P^2 alpha(P))`. Edge storage is `O(P^2)`.

## Common mistakes

- Performing `P-S+1` unions and connecting one group too many.
- Treating `S` as the number of radio edges to keep.
- Using Manhattan distance instead of Euclidean distance.
- Rounding every edge before sorting.
- Summing chosen edges when the objective is the largest necessary radio distance.
