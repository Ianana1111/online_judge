# Count relationship components with a disjoint-set union

## Problem and constraints

Among up to 50000 students, each given pair is known to share a religion and each person follows at most one religion. Find the maximum possible number of distinct religions. Students absent from all pairs still belong to the declared population. Input ends only when both `n` and `m` are zero.

## Building the approach

Treat students as vertices and same-religion pairs as undirected edges. Transitivity forces every connected component to share one religion. No constraint connects different components, so to maximize the count we may assign a different religion to each one. The answer is therefore the number of connected components.

Maintain components with a disjoint-set union. Initially every student is alone, so `groups=n`. For each pair, find the two roots. If they differ, merge them and decrement `groups`; if they are already equal, the edge adds no new constraint and the count stays unchanged.

Path compression and union by size keep operations almost constant time.

## Walkthrough

With five students and pairs `1-2`, `2-3`, and `1-3`, the first two unions combine the first three students. The third edge lies inside that same component and does not reduce the count again. Students four and five remain independent, so the maximum is three religions.

If `m=0`, every student can have a different religion and the answer is `n`; isolated students must not be omitted.

## Why it works

Every edge requires equal religion at its endpoints, and equality propagates along paths, so each connected component can contribute at most one religion. This gives an upper bound equal to the component count.

Assigning distinct religions to different components satisfies every known pair and reaches that bound. DSU begins with exactly `n` components and reduces the count exactly when an edge joins two previously separate ones, so `groups` always equals the graph's component count and hence the answer.

## Complexity

With path compression and union by size, total time is `O((n+m) alpha(n))` and DSU arrays use `O(n)` space.

## Common mistakes

- Returning `n-m` and counting redundant or cyclic edges as new merges.
- Ignoring students that never appear in a pair.
- Linking nonroot nodes without preserving DSU structure.
- Merging unrelated components, which would minimize rather than maximize religions.
- Treating `m=0` alone as the input terminator.
