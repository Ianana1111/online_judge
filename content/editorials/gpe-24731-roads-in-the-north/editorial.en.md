# Find a weighted tree diameter with two traversals

## Problem and constraints

The villages form a connected tree: every pair has exactly one simple path. Road lengths are positive and there are at most 10,000 villages. Find the largest distance between any two villages, the weighted tree diameter. A dataset contains only edge lines, with no node count; blank lines separate datasets, and the final dataset may end directly at EOF.

## Building the approach

Start from any village and traverse the tree while accumulating true road lengths. Let the farthest reached village be `A`. Traverse again from `A`; the greatest distance found in this second pass is the diameter.

The first arbitrary start does not necessarily have diameter eccentricity, but one of its farthest vertices is a diameter endpoint. The second search begins from that endpoint and reaches the other end.

Because a tree has one path between each pair, no shortest-path algorithm is necessary: walking from parent to child gives the only possible distance. Use an explicit stack carrying vertex, parent, and cumulative distance to avoid deep recursion on a 10,000-node chain. Flush one graph at every blank line and once more at EOF.

## Walkthrough

Suppose roads are `1-2` of length 3, `2-3` of length 4, and `2-4` of length 10. Starting from 1 reaches 4 farthest at distance 13. Starting from 4 then reaches 3 at distance 14, which is the diameter.

Taking only the longest single edge would return 10, and treating weights as unit edges would return two; both miss the required distance.

## Why it works

In a positive-weight tree, a vertex farthest from an arbitrary start can serve as an endpoint of some diameter. Compare the start-to-farthest path with any diameter at their branching point: if neither diameter end were replaceable by the chosen farthest endpoint, one of them would be farther from the start, contradicting maximality.

Therefore a diameter has endpoint `A`. The second traversal computes the unique-path distance from `A` to every vertex and selects the largest. It reaches at least the other diameter endpoint, while no path can exceed the global diameter. The reported distance is exactly the diameter.

## Complexity

Each traversal visits every vertex and edge. With map-based adjacency, construction and lookup cost `O(V log V)`; storage and traversal stack use `O(V)` space.

## Common mistakes

- Counting edges instead of summing their weights.
- Reporting the first search's distance.
- Applying the two-sweep property to an arbitrary cyclic graph.
- Failing to process the final dataset at EOF.
- Recursing down a long chain or retaining the previous graph.
