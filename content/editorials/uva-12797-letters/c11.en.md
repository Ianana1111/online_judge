The hard part is the path-wide rule: a letter may not appear in both uppercase and lowercase. Ordinary BFS storing only the current cell would mix paths with different restrictions.

Instead, first choose one permitted case for each of the ten letters, then find a shortest path using only permitted cells. There are just 2^10=1024 choices. Bit i equal to one permits uppercase letter i; zero permits lowercase. Unused letters may be assigned either case, so every legal path is compatible with some mask. Conversely, every path under a fixed mask obeys the rule.

Skip masks incompatible with the start or finish. Otherwise run BFS, starting distance at one because the answer counts cells, not edges. Each orthogonal move adds one and each cell is enqueued at most once per search. Minimize over all masks; print -1 only if none connects the endpoints.

Even without obstacles, a corner-to-corner path needs 2n−1 cells. Finding that lower bound allows immediate termination. Python precomputes neighbors and marks visited cells with the mask number to reduce repeated initialization. Worst-case time is O(2^10 n²), with O(n²) space.
