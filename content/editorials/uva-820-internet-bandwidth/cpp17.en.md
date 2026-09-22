Each `Edge.reverse` indexes its paired entry in the other adjacency list. Recording both list sizes before insertion keeps pairings correct even with parallel links; self-loops are excluded by the input.

DFS returns actual pushed flow and updates forward and reverse capacities together. `next[u]` advances by reference past unusable edges but remains on an edge that may still send more. Every new BFS rebuilds levels and resets current edges. `total` uses `long long` and accumulates until the sink is unreachable.
