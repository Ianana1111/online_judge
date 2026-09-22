`color=-1` represents unvisited vertices, while zero and one are actual colors. A vertex is colored before entering the queue, preventing multiple predecessors from enqueueing it repeatedly.

Already colored neighbors are compared but never overwritten; changing them could invalidate constraints established by earlier edges. Once `good` becomes false it stays false. The root loop generalizes to disconnected graphs, while connected official inputs are normally completed by the first BFS.
