# Maximize the minimum road capacity along one route

## Problem and constraints

Undirected roads between up to 200 cities have capacity limits from 0 to 10000. Choose one route from a named source to destination that maximizes the cargo weight it can carry. A route's capacity is its smallest edge capacity. Capacities from different routes are not added, so this is neither shortest path nor maximum flow.

## Building the approach

Let `best[v]` be the largest bottleneck capacity found from the source to `v`. Give the source a value above every legal edge, 10001, and other cities zero. Repeatedly choose the unsettled city with largest `best`.

Extending through `u` to `v` creates capacity `min(best[u], capacity[u][v])`, since the narrower of the existing route and new road limits the cargo. Keep the maximum of this candidate and the old `best[v]`. This is the widest-path analogue of Dijkstra: select maximum labels and combine a path with an edge using minimum.

For parallel roads, store their maximum individual capacity. One shipment may choose the better road but cannot add both capacities.

## Walkthrough

If route `A-B-D` has capacities 90 and 10, it carries 10. Route `A-C-D` with both edges 50 carries 50 and is better despite its first edge being below 90. Parallel roads of capacities 5 and 9 allow 9, not 14.

## Why it works

When `u` has the greatest unsettled label, suppose a route to it had a larger bottleneck. The first unsettled city on that route has a settled predecessor, whose earlier relaxation would have assigned it at least that route capacity, larger than `best[u]`; this contradicts selecting `u`. Thus settled labels are optimal. Each relaxation computes exactly the bottleneck of a route extended by one road and compares it with all previous alternatives, so no wider route is missed.

## Complexity

With a capacity matrix and linear selection, graph construction is `O(R)`, the widest-path computation is `O(N^2)`, and storage is `O(N^2)`.

## Common mistakes

- Adding capacities along a path as if they were distances.
- Summing parallel routes as if solving maximum flow.
- Using `max(best[u], edge)` instead of the new minimum bottleneck.
- Selecting the smallest tentative capacity.
- Letting a later smaller parallel road overwrite a larger one.
