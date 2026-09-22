# Compute total bandwidth with an undirected residual max-flow network

## Problem and constraints

Up to 100 nodes are connected by undirected links of capacity 0 through 1000, with parallel links allowed. Data may travel simultaneously along multiple paths. Find total maximum bandwidth from a specified source to sink. This differs from finding one widest path. Output the numbered network, bandwidth sentence, and a blank line; `n=0` ends input.

## Building the approach

Represent each undirected link with two mutually reverse residual edges, both initially capacity `c`. Sending `f` from `u` to `v` reduces that direction to `c-f` and increases the reverse to `c+f`; the extra `f` represents permission to cancel prior net flow. Opposite simultaneous flows can be canceled without changing node balances, so this net-flow representation respects the shared physical capacity.

Run Dinic: BFS constructs levels in the positive-capacity residual graph, DFS sends flow only to the next level, and current-edge indices avoid rescanning exhausted choices. Repeat until the sink is unreachable. Keep parallel links as separate edge pairs so their capacities add naturally.

## Walkthrough

Two parallel links of capacities 10 and 20 between source and sink provide bandwidth 30, even if one is listed in reverse endpoint order. A four-node network may send 10, 10, and 5 units along different routes for total 25; returning only the first route's bottleneck 10 is incorrect. Zero-capacity links contribute no residual path.

## Why it works

Every DFS augmentation follows a residual source-to-sink path, preserving capacities and flow conservation. Reverse residual capacity permits canceling and rerouting earlier choices. When no residual source-to-sink path remains, take the set reachable from the source: every original edge leaving it is saturated in net flow, so current flow equals that cut's capacity. No feasible flow can exceed any cut, proving the current value maximum.

## Complexity

Dinic has general bound `O(V^2E)` and uses `O(V+E)` residual storage. `long long` safely accumulates capacities across many parallel edges.

## Common mistakes

- Giving initial capacity to only one direction of an undirected link.
- Overwriting instead of preserving parallel links.
- Failing to add reverse residual capacity after augmentation.
- Stopping after one augmenting path.
- Treating cancellation capacity as new physical bandwidth.
