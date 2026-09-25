The answer counts connected regions, not cells. Scan the grid. Whenever an unvisited letter is found, this is the first cell of one previously uncounted country. Save its letter, run a four-direction flood fill through all matching cells, mark them visited, and increment that language's component count once.

An explicit stack avoids recursion-depth trouble for a long winding country. Because valid input contains only lowercase letters, replacing a cell with `.` safely marks it visited. Mark a neighbor when it is pushed, not when it is later popped, so multiple paths cannot insert the same cell repeatedly.

Finally, collect only letters with positive counts and sort by the two requested keys.

Each unseen letter starts one four-neighbor component; BFS marks the whole country. Rank languages by descending component count, then ascending letter.
