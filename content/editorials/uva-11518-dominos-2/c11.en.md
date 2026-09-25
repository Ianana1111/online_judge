The result is exactly the union of vertices reachable from all pushed sources. Build a directed adjacency list and use one shared `seen` array. Mark and enqueue every source that has not already been seen, counting it once. Then perform BFS: whenever a fallen domino has an outgoing neighbor not yet marked, mark, count, and enqueue it.

All sources share one search state. Running independent searches and summing would double-count their overlap. An explicit queue also avoids recursion-depth dependence on a chain of 10,000 dominoes.

All versions mark a domino as soon as it is enqueued. This avoids duplicates from cycles and repeated pushes; the final queue length is the answer.
