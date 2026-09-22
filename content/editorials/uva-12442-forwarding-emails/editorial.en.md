# Peel functional-graph trees, solve cycles, and restore in reverse

## Problem and constraints

Each of up to 50,000 people forwards to exactly one other person. Choose the starting recipient who reaches the most distinct people, breaking ties by smallest ID. Every component of this functional graph eventually enters a directed cycle.

## Building the approach

Compute indegrees and repeatedly remove indegree-zero vertices, recording their order. What remains consists only of cycles. Walk each unprocessed cycle, measure its length, and assign that reach count to every cycle vertex.

Process removed vertices in reverse order. Their successors are already solved, and an off-cycle vertex contributes itself once, so `reach[u]=reach[next[u]]+1`. A final increasing scan with strict improvement preserves the smallest tied ID.

## Walkthrough

If 1 and 2 form a cycle, 3 forwards to 2, and 4 forwards to 3, their reach counts are 2, 2, 3, and 4, so 4 wins. If everyone shares one cycle, every count ties and person 1 wins.

## Why it works

An indegree-zero vertex cannot lie on a cycle, and repeated removal eliminates precisely all trees feeding cycles. Every remaining cycle vertex reaches exactly the whole cycle. In reverse removal order, a vertex's successor count is known; the vertex itself cannot already occur there unless it were cyclic, so adding one is exact. Thus all reach counts and the final argmax are correct.

## Complexity

Every vertex and edge is handled constantly many times, for `O(N)` time and `O(N)` space.

## Common mistakes

- Counting cycle vertices repeatedly.
- Ignoring the chain before a cycle.
- Assuming input rows are in source-ID order.
- Using `>=` and choosing a larger tied ID.
