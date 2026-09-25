Deleting each vertex and searching again would work, but it repeats most of the same exploration. During one DFS, let `entered[u]` be the discovery time of `u`. Let `low[u]` be the earliest discovery time reachable from the DFS subtree of `u` by descending through tree edges and using at most one back edge upward.

After recursively visiting a child `v`, update `low[u]` with `low[v]`. For an already visited neighbor other than the parent, update it with that neighbor's discovery time.

For a non-root vertex `u`, if some DFS child `v` has `low[v] >= entered[u]`, that child's subtree has no route to a strict ancestor of `u` without passing through `u`; removing `u` separates it. The DFS root needs a separate rule because it has no ancestor: it is an articulation point exactly when it has more than one DFS-tree child.

The implementation first deduplicates edges in a boolean matrix. This keeps repeated input descriptions from behaving like extra parent edges.

Deduplicate the undirected edges. DFS records discovery time and the earliest ancestor reachable from each subtree; a non-root is critical if a child cannot reach above it, while the root needs at least two DFS children.
