# Wait for every predecessor before finalizing a longest path

## Problem and constraints

In a directed acyclic graph with 2 to 100 vertices, find the longest path starting at s, measured in edges, and its ending vertex. Break equal-length endpoint ties by smaller vertex number. Every vertex is reachable from s. An edge pair `0 0` ends one graph's edges; N = 0 ends all input. Print a blank line after each case.

## Building the approach

First-arrival BFS distances answer a shortest-path question, not this one. A vertex may have a direct route from s and a longer route through several other vertices. We must wait for all possible predecessors before deciding its longest distance.

The acyclic guarantee supplies that order. In topological order, every predecessor of a vertex has already been processed. Let `distance[v]` be the longest path length from s to v. For each edge u → v, try `distance[u] + 1`.

Use Kahn's algorithm to obtain the order while updating distances: enqueue zero-indegree vertices, process their outgoing edges, and enqueue a neighbor only when all its incoming edges have been removed. Finally scan all endpoints, preferring greater distance and then smaller number. Input edge order must not decide a tie.

## Walkthrough

With edges `1→2, 1→3, 2→4, 3→4, 4→5`, the distance to 4 is two and the distance to 5 is three. Starting at 1, choose endpoint 5 with length three. If the only edges are `1→3` and `1→2`, both endpoints have length one, so choose 2 even though its edge appears later.

## Why it works

When a vertex is processed, all predecessors have their final longest distances. Every nonempty path to that vertex ends with one incoming edge, so taking the maximum predecessor distance plus one covers every possible path. Every such candidate is also realizable by extending a predecessor's path. Induction over topological order proves the distances, and the final comparison implements the required endpoint tie rule.

## Complexity

O(N + M) time and space for M edges. A path in a DAG cannot repeat a vertex, so its length is at most N − 1.

## Common mistakes

- Using first-arrival BFS distance.
- Counting vertices instead of edges.
- Breaking endpoint ties by discovery order.
- Treating the edge sentinel as the end of all input.
- Applying this DAG recurrence to a graph with directed cycles.
