# Reroot weighted distance sums across every tree edge

## Problem and constraints

Up to 50,000 subway stations form a weighted tree. Listed destination stations are visited a given number of times per year, and every trip goes from home to the destination and back. Find the minimum annual travel time and print every optimal home station in increasing order. There may be no listed destinations, and 64-bit totals are required.

## Building the approach

Root the tree at station 1. Compute every distance from the root, the total visit frequency in each subtree, and the root's one-way weighted distance sum. Let `total` be total demand and `subtree[v]` be demand inside child `v`'s subtree.

When home moves across an edge of length `w` from parent `u` to child `v`, all `subtree[v]` visits become `w` closer and all other visits become `w` farther. Therefore `cost[v]=cost[u]+w*(total-2*subtree[v])`. Applying this formula parent before child obtains every cost in linear time. Minimize the one-way values, then double only the printed annual time.

## Walkthrough

For two stations 17 seconds apart with frequencies 5 and 10, living at station 1 costs `10*17` one way, while station 2 costs `5*17`; station 2 is optimal and the round-trip annual result is 170. If equal demand lies at both ends of a path, every station on that path ties and must be printed.

## Why it works

A tree has one path between each pair. Crossing the parent-child edge removes exactly that edge from paths to destinations in the child's component and adds it to every other path, proving the reroot formula after weighting by frequency. The initial root sum is computed directly, so induction along parent-first order makes every derived cost exact. Doubling all costs preserves the complete set of minimizers, which the final increasing scan prints.

## Complexity

Each traversal visits every vertex and edge a constant number of times, so time and storage are `O(n)`. Iterative traversal also handles a 50,000-node chain without recursive stack risk.

## Common mistakes

- Storing subtree vertex counts instead of visit frequencies.
- Adding the outside increase without subtracting the inside decrease.
- Forgetting to double for return trips.
- Printing only one station when several tie.
- Using 32-bit arithmetic for weighted annual totals.
