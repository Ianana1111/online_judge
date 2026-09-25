Only labels appearing in an edge are vertices. Record adjacency and indegree. For a nonempty case, collect indegree-zero vertices and require exactly one; require every other vertex to have indegree exactly one.

These degree checks alone are insufficient: a valid rooted component may coexist with a disconnected directed cycle, whose nodes all have indegree one. Therefore run BFS from the unique root and require its visited count to equal the total vertex count. Keep duplicate edges because a repeated parent edge raises the child's indegree above one; self-loops likewise fail through the same rules.

An empty case succeeds directly and has no invented root label.

Only labels appearing in edges are vertices. A nonempty tree needs one indegree-zero root, indegree one elsewhere, and full reachability from that root; the empty graph is also a tree.
