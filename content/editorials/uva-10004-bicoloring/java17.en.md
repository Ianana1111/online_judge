An edge forces its endpoints to have opposite colors. Once one vertex receives an arbitrary color, path parity forces every reachable color; search only needs to propagate constraints and detect contradictions.

Use `-1` for uncolored and `0/1` for the two colors. Begin BFS at an uncolored root. When visiting edge `u-v`, color an uncolored `v` as `1-color[u]` and enqueue it. If `v` is already colored and equals `u`, the edge violates the requirement and the graph is not bicolorable.

Store each undirected edge in both adjacency lists. Although official cases are connected, scanning all uncolored roots makes the implementation correct for general disconnected input as well.

Color from vertex zero by BFS; an edge with equal-colored endpoints proves impossibility.
