# Find articulation points with DFS low-link values

## Problem and constraints

The input describes a connected undirected network with `N < 100` vertices. We must count the vertices whose removal disconnects the remaining network: the articulation points. An edge may be described more than once or in both directions, and each network's adjacency lines end with zero.

## Building the approach

Deleting each vertex and searching again would work, but it repeats most of the same exploration. During one DFS, let `entered[u]` be the discovery time of `u`. Let `low[u]` be the earliest discovery time reachable from the DFS subtree of `u` by descending through tree edges and using at most one back edge upward.

After recursively visiting a child `v`, update `low[u]` with `low[v]`. For an already visited neighbor other than the parent, update it with that neighbor's discovery time.

For a non-root vertex `u`, if some DFS child `v` has `low[v] >= entered[u]`, that child's subtree has no route to a strict ancestor of `u` without passing through `u`; removing `u` separates it. The DFS root needs a separate rule because it has no ancestor: it is an articulation point exactly when it has more than one DFS-tree child.

The implementation first deduplicates edges in a boolean matrix. This keeps repeated input descriptions from behaving like extra parent edges.

## Walkthrough

In the chain `1-2-3`, the subtree below 3 cannot reach above 2, so vertex 2 is the only articulation point. In a triangle, every child subtree has a back route upward, so there are none. In a star, the center may be the DFS root and has several DFS children; the special root rule correctly marks it.

## Why it works

For a non-root `u`, `low[v] >= entered[u]` means every path from child subtree `v` to vertices discovered before `u` passes through `u`. Removing `u` therefore disconnects that subtree. If all child low-link values are smaller, each child subtree can reach an ancestor of `u` without using `u`, so the remaining parts stay connected through those routes.

Different DFS children of the root have no edge between their subtrees; otherwise the later one would have been discovered during the earlier recursion. Removing the root disconnects the graph exactly when at least two such child subtrees exist. Hence the two marking rules identify precisely all articulation points.

## Complexity

Building and converting the matrix takes `O(N^2)` time and space. DFS itself takes `O(N + E)` time and space, with recursion depth at most `N`.

## Common mistakes

- Applying the non-root rule to the DFS root.
- Using `low[v] > entered[u]` and missing the equality case.
- Updating a back edge with `low[v]` instead of `entered[v]`.
- Counting the same articulation point once per qualifying child.
- Parsing tokens without respecting the adjacency-line structure.
