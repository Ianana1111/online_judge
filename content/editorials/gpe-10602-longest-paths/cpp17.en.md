`edges` stores outgoing neighbors, while `degree` counts incoming edges. `distance` starts at a large negative value except for `distance[start] = 0`; the statement's reachability guarantee ensures every vertex eventually receives a valid distance from the start.

For each outgoing edge, the program first tries to improve the neighbor's distance, then decrements its remaining indegree. Reaching zero means every predecessor has contributed, so the neighbor is ready for processing. The queue therefore represents topological readiness, not shortest-path layers.

The final scan explicitly checks both greater distance and smaller-number ties. `finish = start` also gives a valid initial endpoint. The case sentence reports the edge count and chosen endpoint, followed by the required blank line.
