Sort edges by increasing weight and maintain connectivity formed by already processed lighter edges with DSU. For edge `(u,v,w)`, if `u` and `v` are already connected, a path of strictly lighter edges joins them; adding the current edge closes a cycle in which `w` is uniquely heaviest, so record it. Otherwise union the two components.

These are exactly the edges rejected by Kruskal's minimum spanning forest. Rejected lighter edges may be omitted from DSU because their endpoints were already connected, so they never change the lighter subgraph's components. Distinct weights remove any same-weight batch ambiguity.

Process edges lightest first. When DSU says the endpoints are already connected, a lighter path plus this edge forms a cycle, so record the rejected weight. The stated distinct-weight guarantee matters.
