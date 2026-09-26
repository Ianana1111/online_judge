We remove vertices, not cables. Choose two nonadjacent vertices s and t and ask how many other vertices must be removed to disconnect them.

Split each vertex v into v_in and v_out, connected by a capacity-1 edge. Using v consumes that capacity. Replace each undirected cable with two directed capacity-n edges, preventing a minimum cut from preferring cables. Start at s_out and finish at t_in, so the endpoints themselves cannot be removed. The minimum cut in this network is exactly the minimum vertex cut between s and t, which maximum flow computes.

Take the minimum over all nonadjacent pairs. Adjacent vertices retain their direct cable when other vertices are removed, so skip those pairs. A complete graph is special: every remaining graph is connected, so its answer is n by definition. Handle empty and single-vertex graphs likewise.

`bfs` builds levels and `send`/`dfs` pushes flow through them. Reverse edges allow later paths to revise earlier choices. Initialize the answer with the minimum degree, and stop a pair's flow when it reaches that bound. Storage is O(V+E); general Dinic has worst-case O(V²E), repeated over at most O(V²) pairs. Here V≤50.
