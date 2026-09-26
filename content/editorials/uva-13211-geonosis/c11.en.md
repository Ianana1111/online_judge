Deleting a vertex can invalidate shortest paths that used it. Reverse the process: begin with all vertices removed and add them back in reverse deletion order.

When adding k, previous phases already allowed earlier restored vertices as intermediates. Perform one Floyd phase: d[u][v]=min(d[u][v],d[u][k]+d[k][v]). This incorporates paths that may also use k.

Update all endpoints u,v, including vertices not yet active. Otherwise, when an endpoint later appears, its distances through already restored intermediates may still be stale. Restrict endpoints to active vertices only when summing charges.

After each addition, sum all ordered active pairs. The graph is directed, so both u→v and v→u count; diagonal costs are zero. This corresponds to the forward state before deleting that vertex, not the state before restoring it.

The general algorithm takes O(n³) time and O(n²) storage; accumulated charges use 64 bits. Python updates rows with list operations and reads bounded input chunks. It also certifies a special case: if every off-diagonal edge is c+p[v]−p[u] with c>0, triangle inequalities already hold and indirect routes cannot improve it. Only after verifying the complete form does it count each edge's charged occurrences from its endpoints' earliest deletion position. Otherwise it runs ordinary Floyd.
