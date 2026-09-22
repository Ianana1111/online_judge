# Detect cycle maxima from connectivity using lighter edges

## Problem and constraints

In an undirected weighted graph, output every edge weight that is the heaviest edge of some cycle, in increasing order, or `forest` if none exists. The graph may be disconnected. The original specification guarantees all weights are distinct and no vertex pair has parallel edges.

## Building the approach

Sort edges by increasing weight and maintain connectivity formed by already processed lighter edges with DSU. For edge `(u,v,w)`, if `u` and `v` are already connected, a path of strictly lighter edges joins them; adding the current edge closes a cycle in which `w` is uniquely heaviest, so record it. Otherwise union the two components.

These are exactly the edges rejected by Kruskal's minimum spanning forest. Rejected lighter edges may be omitted from DSU because their endpoints were already connected, so they never change the lighter subgraph's components. Distinct weights remove any same-weight batch ambiguity.

## Walkthrough

For a triangle with edge weights 1, 2, and 3, the first two connect all vertices and weight 3 is rejected and reported. Two disconnected trees contain no cycle even though the whole graph is not one tree, so output is `forest`. An edgeless graph has the same output.

## Why it works

If endpoints are connected before processing `w`, their lighter path plus the current edge forms a cycle and all other edges are strictly lighter. Conversely, if the current edge is the heaviest edge of a cycle, removing it leaves a path between its endpoints made entirely of lighter edges, all processed already, so DSU must report them connected. DSU unions exactly component-changing edges and therefore preserves the connectivity of the full lighter-edge subgraph. Both implications prove the recorded set is exact.

## Complexity

Sorting costs `O(M log M)` and DSU operations `O(M alpha(N))`, with `O(N+M)` space.

## Common mistakes

- Reporting only one globally heaviest edge.
- Processing edges in descending order.
- Printing edges accepted by Kruskal rather than rejected ones.
- Treating a disconnected forest as cyclic.
- Ignoring that the proof relies on the stated distinct-weight specification.
