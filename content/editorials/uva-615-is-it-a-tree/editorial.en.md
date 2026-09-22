# Check one root, one parent per node, and full reachability

## Problem and constraints

Each case is a collection of directed edges on labels 1 through 100, ending with `0 0`; a pair of negative integers ends all input. A nonempty directed tree has exactly one indegree-zero root, every other node has indegree one, and every node is reachable from the root. The empty graph also counts as a tree. This platform prints the root suffix only for a nonempty valid tree, and repeated edges count separately.

## Building the approach

Only labels appearing in an edge are vertices. Record adjacency and indegree. For a nonempty case, collect indegree-zero vertices and require exactly one; require every other vertex to have indegree exactly one.

These degree checks alone are insufficient: a valid rooted component may coexist with a disconnected directed cycle, whose nodes all have indegree one. Therefore run BFS from the unique root and require its visited count to equal the total vertex count. Keep duplicate edges because a repeated parent edge raises the child's indegree above one; self-loops likewise fail through the same rules.

An empty case succeeds directly and has no invented root label.

## Walkthrough

Edges `2->1` and `2->3` give root 2, indegree one for the others, and full reachability, so they form a tree. Edges `1->2`, `3->4`, `4->3` have one indegree-zero vertex but leave the 3-4 cycle unreachable, so they do not. A case containing no edges before `0 0` is the valid empty tree.

## Why it works

Every directed tree necessarily passes the root, indegree, and reachability checks. Conversely, suppose all checks pass. If a directed cycle existed, the root could not lie on it. The first entry from the root-reachable structure into that cycle would give its entry node both an external parent and its cycle predecessor, contradicting indegree one. Thus the graph is acyclic; with one root, one parent per other node, and full reachability, each node has a unique root path and the graph is a tree. The empty case follows the problem definition.

## Complexity

For `V <= 100` appearing vertices and `E` listed edges, construction and BFS take `O(V+E)` time and adjacency storage takes `O(V+E)` space.

## Common mistakes

- Treating edges as undirected and checking only connectivity.
- Checking only indegrees and missing a disconnected cycle.
- Treating every label from 1 through 100 as an existing vertex.
- Rejecting the empty tree or printing a fake root zero.
- Failing to clear graph state between cases.
