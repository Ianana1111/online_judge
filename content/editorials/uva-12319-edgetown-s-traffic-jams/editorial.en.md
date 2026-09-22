# Compare every directed shortest path in the old and proposed networks

## Problem and constraints

An old directed street network and a proposed network contain 3 through 100 intersections, with every listed street costing one block. For every ordered pair whose old shortest distance is `x`, the proposal must have distance at most `A*x+B`; the old graph is strongly connected, but the proposal need not be. This platform additionally requires the old network's maximum shortest-path distance after `Yes` or `No`.

## Building the approach

Build a directed distance matrix for each graph: zero on the diagonal, one for a listed arc, and infinity otherwise. Run Floyd–Warshall independently on both matrices to obtain all-pairs shortest paths.

For every ordered pair, reject the proposal if its distance is infinite or exceeds `A*old+B`. At the same time, take the maximum entry of the old distance matrix for the required directed diameter. Streets must not be given implicit reverse arcs.

## Walkthrough

If the old distance is 2 and `A=1, B=2`, a proposed distance of 4 is valid while 5 is not; equality with the bound is allowed. If a return direction becomes unreachable while the outward direction remains reachable, the proposal still fails because ordered pairs include both directions.

## Why it works

After Floyd iteration `k`, each matrix entry is the shortest path whose internal vertices come from the processed set: such a path either avoids `k` or splits into shortest parts through `k`. Induction gives all correct pair distances. The specification is a conjunction over exactly those ordered pairs, so accepting precisely when every finite proposal distance meets its affine bound is equivalent to the requirement. The maximum old entry is exactly the requested old directed diameter.

## Complexity

Two Floyd–Warshall runs take `O(n^3)` time, pair validation takes `O(n^2)`, and both matrices use `O(n^2)` space.

## Common mistakes

- Adding reverse arcs that were not listed.
- Checking only originally adjacent intersections.
- Rejecting a distance equal to `A*x+B`.
- Allowing an unreachable proposed pair through infinity arithmetic.
- Printing the proposal diameter instead of the platform's old-network value.
