Every road must be used exactly once and the trip must return to its start: an Euler circuit. Each undirected vertex needs even degree, and every road must be reachable from the starting component. The start is prescribed as the smaller endpoint of the first input road.

Use Hierholzer's algorithm. While a vertex has an unused road, push its neighbor and record that entering road. At a dead end, pop the vertex and append its entering road to route. The resulting route is reversed; reverse it for the circuit. This splices smaller cycles into the final tour rather than stopping on the first return to the start.

The road-ID sequence must be lexicographically smallest, so sort each vertex's incident roads by ID and explore the smallest unused one first. Append roads on backtracking; exploration order itself is not necessarily the completed tour. Verify route length equals the total road count to check connectivity as well.

Track used by road ID, not endpoint pair. Parallel roads are distinct; a loop contributes twice to degree but is traversed once. next remembers the incident-edge scan position and avoids repeatedly scanning used roads.

Use explicit stacks rather than recursion, avoiding Python recursion-depth limits with up to 1994 roads. Sorting takes O(E log E), traversal O(E), and storage O(E+V). Print the specified failure sentence when no circuit exists and leave a blank line after each answer.
