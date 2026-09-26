Being in the same cell does not mean being in the same state: the next move length can be 1, 2 or 3. BFS visitation must therefore include both position and phase. Start in phase 0, then cycle through lengths 1, 2, 3.

A move follows one fixed direction. Check every intermediate cell, not merely the landing cell; a wall in the middle makes the move invalid. Advance the phase only for a legal move. Each complete move has unit cost, so the first dequeued exit has minimum distance. Encode states as 3·position+phase and keep separate distances for all three phases.
