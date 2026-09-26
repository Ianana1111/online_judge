Input row/column sums are cumulative. Subtract consecutive values to recover individual totals. Every cell lies in 1..20, so first put one in every cell: subtract the column count from each row demand and the row count from each column demand. Each cell then needs an additional 0..19.

Create one node per row and column. Source-to-row capacity is its remaining demand, column-to-sink capacity is its remaining demand, and each row-to-column edge has capacity 19. Any integral flow satisfying all demands is a valid matrix.

Dinic builds levels with BFS, then sends flow with DFS along the next level. Reverse capacities are essential: later paths can undo an earlier allocation and redirect it to another column. Greedy irreversible filling can fail. next records the current outgoing position to avoid repeatedly examining exhausted edges.

Each cell edge began with capacity 19, so its flow is 19−remaining capacity. Restore the baseline one and print 20−capacity. A solution is guaranteed; it need not match the sample cell by cell, only satisfy cell bounds and all cumulative sums. There are at most 42 nodes. The capacity matrix uses O(V²) space, each BFS scans O(V²), and DFS uses current-arc optimization as in standard Dinic.
