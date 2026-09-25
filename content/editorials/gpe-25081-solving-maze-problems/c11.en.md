Cells explored during a search are not necessarily part of the answer because search may enter dead ends. Keep exploration separate from drawing.

Run breadth-first search from `S`. For every newly reached cell `v`, store `parent[v]`, the cell from which it was first discovered. The parent array also serves as the visited marker, with the start pointing to itself. Do not change grid characters while searching.

If the goal has no parent after BFS, it is unreachable. Otherwise follow parents backward from `G` through `S`, replacing exactly those cells with `+`. The uniqueness guarantee means this discovered path is the required one.

Breadth-first search from S records each cell’s predecessor. After reaching G, walk backward through those predecessors and mark the path with plus signs. Visiting neighbors up, right, down, left makes ties deterministic.
