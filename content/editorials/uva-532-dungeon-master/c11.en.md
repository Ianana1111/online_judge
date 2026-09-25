Treat every open cell as a graph vertex and every legal six-direction move as an edge of cost one. Initialize distances to -1, set the start to zero, and perform breadth-first search. For each dequeued cell, test all six neighbors; a neighbor within bounds, not rock, and still unvisited receives current distance plus one and is marked when enqueued.

The implementation flattens `(z,y,x)` into one integer id, but restores coordinates before generating neighbors and checks each axis independently. Directly adding one to a flat id could incorrectly wrap from the end of one row to the start of another. Formatted row input naturally skips floor-separator blank lines.

Every move costs one minute, so ordinary BFS finds the shortest escape. Flatten level, row, and column into one index, but check all three coordinate bounds before visiting a neighbor.
