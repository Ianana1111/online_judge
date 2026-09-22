`letter` stores indices zero through nine and `upper` stores each cell's case. `allowed` compares the corresponding mask bit with that case, and the same predicate rejects incompatible endpoints before BFS.

Distance -1 means unvisited for the current policy. A cell is marked when enqueued, so the fixed-size queue never exceeds `n*n`. The first arrival at the finish is that policy's shortest path. Only reaching `2*n-1` stops the outer policy loop; if all searches fail, the untouched sentinel becomes -1.
