# Turn a chain of cycles into two routes

## Problem and constraints

Given an undirected multigraph and distinct vertices S and T, determine whether cycles can form a necklace from S to T. Consecutive cycles share exactly one vertex; nonconsecutive cycles share none, and no cycles share an edge. There are at most 10,000 vertices and 100,000 edges. Parallel edges are allowed, self-loops are not, and **this problem accepts two parallel edges as a cycle**. This differs from the platform's simple-graph RACING problem.

## Building the approach

Trying to enumerate cycles is unnecessary. Imagine walking through a valid necklace: each cycle offers two sides between its entry and exit vertices. Following all the first sides gives one S-to-T route; following the other sides gives another. The routes may meet at the joints, but never share an edge.

This suggests looking for two edge-disjoint routes, not two vertex-disjoint routes. Equivalently, send two units of flow when each undirected edge can carry one unit in either direction. We can stop after two successful augmentations; computing a larger maximum flow would tell us nothing more.

The second search must use residual edges. Simply deleting the first route can fail because part of that first choice may need to be rerouted. Pair the two directions of each undirected edge, initially with capacity one in both directions. Sending a unit decreases forward residual capacity and increases reverse capacity, allowing a later search to undo that choice.

## Walkthrough

In a triangle, S and T have a direct route and a route through the third vertex, so answer YES. Two cycles meeting at one articulation vertex also work: that shared vertex is a legitimate necklace joint. If a single bridge connects the two sides instead, every route must use it, so answer NO. Two parallel S–T edges are a valid YES case here.

## Why it works

A necklace supplies two edge-disjoint routes by choosing its two sides. Conversely, two such routes have no bridge separating S from T in their union. Along its block-cut tree from S to T, each non-bridge block contains a cycle through its entry and exit vertices. Selecting those cycles forms a chain whose adjacent members share only the intervening articulation vertex. A parallel-edge block supplies its permitted two-edge cycle.

Integral flow with unit undirected edge capacities gives the required routes after canceling opposite flow and discarding cycles. Residual augmentation either finds another unit or exposes a cut proving none is possible. Thus reaching flow two is exactly the desired condition.

## Complexity

At most two breadth-first searches take O(N + M) total time and O(N + M) space. No recursive graph traversal is required.

## Common mistakes

- Merging parallel edges.
- Checking only ordinary connectivity.
- Prohibiting shared vertices, which rejects valid joints.
- Removing the first route without allowing residual rerouting.
- Applying RACING's different cycle rules to this problem.
