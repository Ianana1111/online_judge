# Recognize a directed line graph by its successor sets

## Problem and constraints

In the unknown directed graph `D`, every edge becomes a vertex of graph `E`. Graph `E` contains an edge from one such vertex to another exactly when the corresponding edges of `D` can be concatenated. Given `E` with at most 300 vertices, determine whether some `D` can produce it. Parallel edges and self-loops are allowed in `D`, and an empty graph is valid.

## Building the approach

Imagine again that each vertex of `E` represents an edge of `D`. The outgoing neighbors of vertex `u` are all edges that can follow `u`'s edge. If two vertices `u` and `v` share even one successor, their represented edges must end at the same vertex of `D`. Edges with the same endpoint have exactly the same set of possible following edges.

Therefore, every pair of outgoing-neighbor sets must be either disjoint or identical. Store each adjacency row in a bitset. For every pair of rows, compute their intersection; if it is nonempty but the rows differ, answer `No`. Otherwise answer `Yes`. Empty rows intersect nothing and require no special rejection.

## Walkthrough

If `u` has successors `{a,b}` and `v` has `{a}`, the shared successor `a` says their represented edges end at the same `D` vertex, but then the missing successor `b` is impossible. The graph is invalid. If both sets are `{a,b}`, they can share an endpoint. A single vertex with a self-loop is also valid: it can come from one self-loop edge in `D`.

## Why it works

Necessity follows directly: a shared successor forces equal endpoints in `D`, and equal endpoints permit the same complete set of next edges.

For sufficiency, create a left copy and a right copy of every vertex of `E`, representing the endpoint and start point of its corresponding `D` edge. Connect left `u` to right `v` whenever `E` has `u -> v`. The disjoint-or-equal condition makes every nonempty connected component a complete bipartite graph: left vertices sharing any right neighbor share all right neighbors. Create one vertex of `D` for each such component, with separate vertices for isolated copies. The vertex `v` of `E` then represents an edge from the component of right `v` to the component of left `v`. Two constructed edges concatenate exactly for the original adjacencies of `E`, so this `D` produces precisely `E`.

## Complexity

With `m` vertices, pairwise bitset comparisons take `O(m^2 * ceil(m/w))` machine-word operations, where `w` is the word size. The adjacency bitsets use `O(m^2)` bits.

## Common mistakes

- Allowing partially overlapping sets such as `{a}` and `{a,b}`.
- Rejecting cycles or self-loops even though they may be valid.
- Comparing only out-degrees instead of the actual successor sets.
- Treating an empty successor set as invalid.
- Adding restrictions against parallel edges that the original graph explicitly allows.
