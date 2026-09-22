# Sum the absolute surplus crossing every parent edge

## Problem and constraints

A rooted tree has `n` vertices and exactly `n` marbles in total. One move sends one marble across one adjacent edge. Find the minimum moves needed to leave exactly one marble at every vertex. Input rows may appear in arbitrary order, labels need not follow traversal order, and the root is not necessarily one. `n<=10000`.

## Building the approach

For a subtree, define

`balance = current marbles - number of vertices`.

A positive balance must leave through its parent edge; a negative balance must enter through that edge. Because this is the subtree's only connection to the outside, at least `abs(balance)` marbles must cross that edge.

Read child lists, construct parent links, and locate the vertex without a parent. Build any order with parents before children, then process it in reverse. Initialize each vertex with `own marbles-1`. Once all children have contributed, add `abs(balance[v])` to the answer and add the signed balance to its parent. Skip the root because it has no outside edge.

An explicit order avoids recursion depth on a chain of ten thousand vertices.

## Walkthrough

Consider chain `3 -> 1 -> 2`, with all three marbles at root 3. Vertex 2 lacks one, so one marble crosses edge 1-2. The subtree rooted at 1 contains two vertices and initially no marbles, so two marbles cross edge 3-1. Total cost is three, because marbles traveling farther are counted once per edge.

## Why it works

Cut any parent edge. The child subtree must finish with one marble per vertex, so the net number crossing its only boundary is fixed to its initial surplus or deficit. Every solution therefore pays at least the sum of absolute subtree balances over all nonroot edges.

This lower bound is attainable: direct each edge flow according to the signed balance. A tree has no cycles, so processing flows from leaves toward the root supplies or removes exactly the required amounts and leaves one marble at every vertex. Reverse accumulation computes those exact balances, hence its sum equals the minimum.

## Complexity

Building the tree, traversal order, and reverse accumulation all take `O(n)` time and `O(n)` space.

## Common mistakes

- Assuming vertex one is the root or input rows are already ordered.
- Passing an absolute child balance to the parent and losing flow direction.
- Counting only deficits and omitting upward surplus moves.
- Charging a nonexistent parent edge for the root.
- Counting deficient vertices without accounting for multi-edge travel distance.
