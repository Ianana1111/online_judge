A cell's digit is the cost of entering it, so ordinary step-count BFS is insufficient. Treat cells as vertices and add the destination cell's weight on each orthogonal move. Pay for the starting cell too: initialize distance[0] to its digit.

Pop the cheapest candidate from a min-heap. Skip it if its cost no longer equals the saved distance; it is an obsolete entry. The first valid pop of the destination is optimal. Flatten cells with node=row·columns+column.

For the maximum grid, encode a heap entry as cost·cellCount+node and recover both values by quotient and remainder. This still orders primarily by cost. Python streams input, keeps weights in a bytearray and distances in a compact array; Java uses an array-based long heap to avoid one object per candidate.
