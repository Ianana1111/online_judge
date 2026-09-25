Compute indegrees and repeatedly remove indegree-zero vertices, recording their order. What remains consists only of cycles. Walk each unprocessed cycle, measure its length, and assign that reach count to every cycle vertex.

Process removed vertices in reverse order. Their successors are already solved, and an off-cycle vertex contributes itself once, so `reach[u]=reach[next[u]]+1`. A final increasing scan with strict improvement preserves the smallest tied ID.

Peel all noncycle vertices with an indegree-zero queue. Every vertex on a cycle reaches the cycle length; process peeled vertices backward, giving each one its successor’s reach plus one.
