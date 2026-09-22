Each adjacency entry stores only the stated direction. Source vertices are marked and counted as they enter the queue, so repeated pushes enqueue them once. Neighbors use the same first-mark rule.

Input labels are converted to zero-based vector indices. `fallen` cannot exceed `n`, while each test recreates its graph, visited flags, and queue. If there are no sources, BFS does nothing and prints zero.
