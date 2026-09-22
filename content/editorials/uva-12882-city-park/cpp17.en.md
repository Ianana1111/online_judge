`Side::line` is the fixed coordinate and `begin,end` form the other-axis closed interval, allowing one `connect` routine for both orientations. Sorting groups equal lines and increasing starts; `representative=-1` safely initializes the first group.

When a new interval reaches the current group, DSU joins its ID to an interval reaching the farthest endpoint. If it extends farther, it becomes the new representative. DSU path compression and union by size add areas only when roots differ. Final `find` calls locate each component total and its maximum.
