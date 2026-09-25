Normalize the grid and query to lowercase. Enumerate candidate starts in row-major order: rows outside, columns inside. For each start, try all direction pairs `(dr,dc)` with components in `{-1,0,1}` except `(0,0)`.

The `k`-th word character must match grid position `(r+k*dr,c+k*dc)`. Reject a direction immediately on an out-of-range coordinate or unequal character. Stop the entire search for this query after the first complete match.

Because starts are tested in the exact required order, the first success automatically satisfies the tie rule; direction order within one start cannot affect its coordinate.

Lowercase grid and queries. Try starts in row-major order and all eight directions; the first match is automatically the topmost, then leftmost answer.
