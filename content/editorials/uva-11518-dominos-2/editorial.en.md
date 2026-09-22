# Search the union reachable from every manually pushed domino

## Problem and constraints

A directed relation `x -> y` means falling domino `x` knocks down `y`. Given up to 10,000 dominoes, 10,000 relations, and 10,000 manual pushes, count how many distinct dominoes eventually fall. Cycles, repeated pushes, and overlapping affected regions are possible.

## Building the approach

The result is exactly the union of vertices reachable from all pushed sources. Build a directed adjacency list and use one shared `seen` array. Mark and enqueue every source that has not already been seen, counting it once. Then perform BFS: whenever a fallen domino has an outgoing neighbor not yet marked, mark, count, and enqueue it.

All sources share one search state. Running independent searches and summing would double-count their overlap. An explicit queue also avoids recursion-depth dependence on a chain of 10,000 dominoes.

## Walkthrough

For edges `1->2` and `2->3`, manually pushing 2 falls only 2 and 3; influence does not run backward to 1. If 1 and 2 form a cycle and 2 also reaches 3, pushing both sources still counts the union `{1,2,3}` only once. With no pushes, the queue is empty and the answer is zero.

## Why it works

Every initially marked domino is manually pushed. Every later marked domino has an incoming searched edge from a domino already known to fall, so everything counted truly falls. Conversely, take any directed path from a pushed source. Its source is enqueued, and processing each path vertex examines the next edge, so induction along the path marks its endpoint. Thus all and only the reachable union is marked, and `seen` counts each member once.

## Complexity

Every vertex and edge is processed at most once after `O(M)` graph construction, for `O(N+M+L)` time and `O(N+M)` space.

## Common mistakes

- Adding reverse edges to the directed graph.
- Counting each source independently and duplicating overlap.
- Failing to mark before enqueueing and looping on cycles.
- Ignoring fallen sink vertices with no outgoing edges.
- Solving the different problem of minimum pushes instead.
