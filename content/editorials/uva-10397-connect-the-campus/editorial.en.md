# Treat existing cables as zero-cost edges in a minimum spanning tree

## Problem and constraints

A campus has up to 750 buildings at distinct integer coordinates. Some undirected cables already exist and cannot be removed. Find the minimum total length of additional cable needed to connect every building, printed to two decimal places. Existing cables have already been paid for, so their geometric lengths must not be charged again.

## Building the approach

Consider the complete graph on buildings. Give every existing direct cable weight zero and every other pair its Euclidean distance. A minimum spanning tree in this weighted graph chooses the cheapest extra connections while freely using old cables. Existing cycles may remain physically present; the tree is only a tool for selecting a minimum-cost connecting subset.

Because the graph is dense, use the `O(N^2)` version of Prim rather than storing and sorting all edges. `best[v]` is the smallest squared cost of connecting unselected building `v` to the selected set. Repeatedly select the unvisited vertex with minimum `best`, add the square root of that value to the total, then update every remaining vertex. An existing edge supplies squared cost zero.

Squared distances are sufficient for comparisons because square root is increasing. Convert only an edge that Prim actually chooses, and round only the final sum.

## Walkthrough

Suppose buildings two and four already have a cable. Prim may absorb that connection for zero cost. If the cheapest remaining additions have lengths `sqrt(2)` and `3`, the total is about `4.414`, printed as `4.41`. The old cable contributes zero even though its endpoints are geometrically separated, and paths of several old cables can absorb an entire component for free.

## Why it works

Any feasible set of new cables combined with the zero-cost existing edges forms a connected graph. It contains a spanning tree whose cost is no larger, so the MST cost is a lower bound on every feasible addition plan.

Conversely, every nonzero edge selected by the MST can be installed as a new cable. Together with all existing cables, the tree connects all buildings at exactly its weight, making the MST cost attainable. The two bounds match. Prim's cut property guarantees that repeatedly choosing the lightest edge crossing from the selected set produces this MST.

## Complexity

Dense Prim performs `N` selection scans and `N` update scans, taking `O(N^2+M)` time. The existing-edge matrix uses `O(N^2)` space; coordinates and Prim arrays use `O(N)`.

## Common mistakes

- Charging the actual length of an existing cable.
- Using only direct old links and missing connectivity through a chain of zero-cost links.
- Returning the largest chosen edge instead of the sum.
- Rounding individual edges before adding them.
- Assuming an MST computation means existing cyclic cables must be removed.
