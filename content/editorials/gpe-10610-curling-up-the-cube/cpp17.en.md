`Vec` is an integer unit vector and `Frame` stores `(u, v, n)`. The `turn` direction numbers match the `dr` and `dc` arrays: right, left, down, and up. Keeping those two orders aligned is essential.

The start can be any marked square; choosing the last one read merely rotates the eventual cube. Its frame is initialized to the coordinate axes. During BFS, `seen` controls discovery, while an already discovered neighbor still undergoes a full frame comparison.

`visited` checks connectivity, `valid` records orientation contradictions, and `normals` detects face reuse. All three final conditions are needed. Normals are inserted when a square is popped exactly once, and the final case separator is independent of whether the net succeeds.
