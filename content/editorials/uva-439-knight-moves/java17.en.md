Treat each square as a graph vertex and every legal knight move as an unweighted edge. Initialize every distance to -1, give the source distance zero, and run breadth-first search.

For each dequeued square, try all eight paired coordinate offsets. Ignore out-of-range or already visited destinations. A new square receives the current distance plus one and is marked before entering the queue, preventing duplicate work.

An infinite-board distance formula is unsafe because board boundaries block routes near corners. With only 64 vertices, a direct BFS per query is simple and complete.

Treat squares as vertices and eight knight jumps as edges; BFS distance gives the fewest moves.
