First-arrival BFS distances answer a shortest-path question, not this one. A vertex may have a direct route from s and a longer route through several other vertices. We must wait for all possible predecessors before deciding its longest distance.

The acyclic guarantee supplies that order. In topological order, every predecessor of a vertex has already been processed. Let `distance[v]` be the longest path length from s to v. For each edge u → v, try `distance[u] + 1`.

Use Kahn's algorithm to obtain the order while updating distances: enqueue zero-indegree vertices, process their outgoing edges, and enqueue a neighbor only when all its incoming edges have been removed. Finally scan all endpoints, preferring greater distance and then smaller number. Input edge order must not decide a tie.

Process vertices in topological order so every predecessor has been handled before its destination. Relax longest reachable distances from the chosen start, then break equal-length ties by smaller destination number.
