# Convert minimum vertex deletion into split-node maximum flows

## Problem and constraints

For an undirected network of up to 50 relay vertices, find the minimum vertices whose removal disconnects the survivors. An already disconnected graph has safety zero; empty and singleton graphs count as connected. If no removal can disconnect it, including complete graphs, this problem defines safety as n. Cases continue to EOF, and `0 0` is a valid empty case.

## Building the approach

For any noncomplete graph, a disconnecting deletion separates some surviving nonadjacent endpoints s,t. Enumerate all such pairs. Split each vertex into in and out with capacity one, except endpoints with large capacity n. Replace each undirected edge by both directed out-to-in arcs of capacity n. Maximum flow from s-out to t-in equals the minimum removable internal vertices.

Take the minimum across endpoint pairs. Adjacent pairs are skipped because their direct edge cannot be broken by removing other vertices. Handle complete graphs separately with answer n. Current minimum degree supplies a valid upper bound, and flow may stop after reaching the current answer.

## Walkthrough

A four-vertex path has safety one by deleting an internal vertex. Two dense regions sharing one articulation also have safety one despite large degrees. A triangle remains connected, singleton, or empty after every deletion and therefore returns three by this problem's convention.

## Why it works

Cutting a unit in-to-out edge is exactly deleting that nonendpoint vertex, while large capacities prevent choosing endpoints or original links in any improving cut. Paths correspond between original and split networks, so max-flow/min-cut yields the exact s-t vertex cut. Every global disconnection separates some surviving nonadjacent pair, and every such pair cut disconnects the graph; minimizing pairs equals global safety. Complete graphs require the stated exceptional n value.

## Complexity

There are `O(n^2)` endpoint pairs, each with `O(n)` split vertices and `O(n+m)` arcs. General Dinic bounds are ample for `n<=50`; one network uses `O(n^2+m)` space.

## Common mistakes

- Computing an edge cut instead of vertex deletions.
- Giving endpoint split edges unit capacity.
- Returning n-1 for complete graphs.
- Treating `0 0` as an input terminator.
- Assuming minimum degree always equals connectivity.
