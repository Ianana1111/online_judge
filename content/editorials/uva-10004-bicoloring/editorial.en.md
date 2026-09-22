# Propagate opposite colors with BFS

## Problem and constraints

Given a connected undirected graph without self-loops, decide whether all vertices can be colored with two colors so every edge joins different colors. There are 2 through 199 vertices numbered from zero, and zero vertices terminates input. This is bipartite testing, not a use of the planar four-color theorem.

## Building the approach

An edge forces its endpoints to have opposite colors. Once one vertex receives an arbitrary color, path parity forces every reachable color; search only needs to propagate constraints and detect contradictions.

Use `-1` for uncolored and `0/1` for the two colors. Begin BFS at an uncolored root. When visiting edge `u-v`, color an uncolored `v` as `1-color[u]` and enqueue it. If `v` is already colored and equals `u`, the edge violates the requirement and the graph is not bicolorable.

Store each undirected edge in both adjacency lists. Although official cases are connected, scanning all uncolored roots makes the implementation correct for general disconnected input as well.

## Walkthrough

A three-vertex triangle cannot be bicolored: after coloring two neighbors of vertex zero alike, their connecting edge has equal colors. A four-vertex square alternates `0,1,0,1` successfully. Two vertices with one edge are also valid.

## Why it works

If BFS finishes without conflict, every examined edge has opposite endpoint colors, so the produced assignment is a valid bicoloring.

If an edge connects equal colors, the BFS-tree paths from the component root have forced the same parity at both endpoints. Any valid two-coloring of a connected component can only swap all colors together; it cannot change this parity relation and repair the edge. Therefore the conflict proves that no bicoloring exists.

## Complexity

Each vertex is enqueued once and each undirected edge is inspected twice, giving `O(V+E)` time and `O(V+E)` space.

## Common mistakes

- Storing an undirected edge in only one direction.
- Solving a three-color problem instead.
- Ignoring already colored neighbors rather than checking conflict.
- Using zero both for uncolored and a real color.
- Omitting the periods in the required output strings.
