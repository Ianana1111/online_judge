`Dinic::add` creates a forward edge and a zero-capacity reverse edge, returning the forward index. The `edge[team][table]` table saves these indices so the final flow can be read without searching adjacency lists.

`maximum` uses BFS to assign levels along positive residual edges. `send` follows only the next level, updates both directions after a push, and uses `next[u]` to avoid repeatedly checking exhausted choices in the same phase.

`required` sums all team sizes. Failure to reach it prints only zero. On success, `initial - capacity` gives the used flow of a saved team-to-table edge; its capacity was one, so this is zero or one person. Iterating teams in their original indices and printing table index plus one yields the required assignment format.
