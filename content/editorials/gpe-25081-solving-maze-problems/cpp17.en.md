The grid retains its original characters during BFS. `parent` begins at `-1`; setting the start parent to itself marks it visited before queue insertion. Each neighbor is checked for bounds, walls, and prior discovery before receiving a parent.

After search, an unset goal triggers the fixed failure output. On success, the reconstruction loop begins at the goal, replaces each parent-chain cell with `+`, and breaks only after also replacing the start. Printing the original ten rows then preserves every wall and off-path open cell, followed by the required blank line.
