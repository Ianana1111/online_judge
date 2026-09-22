Each `Edge` records its destination, its paired reverse index, and residual capacity. Adding an undirected edge creates a mutually linked pair with initial capacities one and one. Separate input edges get separate pairs, preserving parallel edges.

For each of at most two rounds, BFS records both a parent vertex and the exact edge index used to reach every vertex. The edge index matters when multiple edges have the same endpoints. Setting `parent[source] = source` marks the source visited before searching.

Once the target is found, the backward walk subtracts one from each selected capacity and adds one to its paired reverse capacity. A reverse capacity of two can occur: one unit can undo earlier flow, and the remaining unit permits flow in the other direction. This represents a net edge flow between −1 and one, not two independent physical edges. The answer is YES only after two successful rounds.
