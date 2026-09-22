Three character variables consume the colon and parentheses in `u:(k)`, after which exactly `k` neighbors are read. Every edge enters both adjacency lists so an arbitrary root reaches the entire tree.

`on` starts at one and `off` at zero. Reverse `order` guarantees completed child states, and `parent[v]==u` prevents adding the parent edge twice. The final root minimum also handles `n=1` correctly. Iteration avoids recursion depth problems on a long chain.
