# Build a minimum spanning tree with Kruskal's algorithm

## Problem and constraints

Up to 26 letter-named cities have a symmetric matrix of tunnel staffing costs. Positive entries are edges; zero means no tunnel. Choose roads keeping the connected network connected with minimum total staff. Any minimum spanning tree is acceptable when ties create multiple answers.

## Building the approach

Extract only positive entries from the matrix upper triangle, avoiding duplicate undirected edges and absent zero entries. Sort edges by weight. Process them with DSU: if endpoints already share a component, skip the edge because it creates a cycle; otherwise union components and record it. Stop after `N-1` selected edges.

Equal weights are secondarily sorted by endpoint in this implementation for stable output, but that is not a problem requirement.

## Walkthrough

In the sample, choosing B-D cost 3, D-F 4, E-F 5, C-E 6, and A-F 7 connects six cities with total 25. For a triangle of three unit edges, any two form a valid MST; adding the third only creates a cycle.

## Why it works

Whenever Kruskal selects an edge, it is a minimum-weight edge crossing between two current components. The MST cut property guarantees some minimum spanning tree can include that edge. DSU rejects precisely cycle-forming edges. Connected input guarantees selection eventually reaches `N-1` edges, forming a spanning tree; repeated safe cut choices make its total minimum.

## Complexity

With `E<=N(N-1)/2`, extraction is `O(N^2)`, sorting `O(E log E)`, DSU work `O(E alpha(N))`, and storage `O(N^2)`.

## Common mistakes

- Treating matrix zero as a free edge.
- Outputting both symmetric matrix directions.
- Choosing each city's cheapest neighbor independently and leaving components disconnected.
- Failing to reject cycles.
- Building a maximum tree or requiring one arbitrary tied MST.
