# Maximize the path bottleneck, then reserve the guide's seat

## Problem and constraints

Undirected roads connect at most 100 cities. Each road's bus has capacity greater than one. A guide must transport `T` tourists from `S` to `D`, and the guide occupies one seat on every trip. Choose a route and number of trips minimizing trips. A route's capacity is limited by its smallest edge, not by the sum of edge capacities or road count.

## Building the approach

For a fixed route, its bottleneck is the minimum road capacity. We need the route whose bottleneck is maximum, a widest-path problem.

Use max-min Floyd. Let `capacity[a][b]` be the largest bottleneck using the currently allowed intermediate cities. A path through `via` has bottleneck

`min(capacity[a][via], capacity[via][b])`.

Compare that candidate with the existing value using max. Store roads in both directions and retain the larger capacity among duplicate endpoints. After Floyd, let the best bottleneck be C. The guide leaves `C-1` tourist seats, so the answer is `ceil(T/(C-1))`, computed with quotient plus a nonzero-remainder indicator. If start equals destination, no transport trips are needed.

## Walkthrough

A route with capacities 30, 25, and 35 has bottleneck 25 and carries 24 tourists per trip after reserving the guide seat. Ninety-nine tourists need five trips; forgetting the guide would incorrectly give four.

A different route containing a capacity-100 edge can still be worse if another edge on it has capacity ten.

## Why it works

Induct on allowed Floyd intermediates. An optimal path either avoids the new intermediate and is already represented, or passes through it and splits into two subpaths. The combined bottleneck is the smaller subpath bottleneck, and choosing each subpath's widest option maximizes that candidate. Taking max with the avoiding case preserves the widest path.

No trip can carry more than `C-1` tourists, so fewer than the ceiling number cannot suffice. Reusing the widest route with up to `C-1` tourists per trip attains that ceiling, proving minimality.

## Complexity

Floyd uses `O(N^3)` time and `O(N^2)` space.

## Common mistakes

- Summing capacities or solving a shortest path.
- Forgetting the guide's seat.
- Rounding trip division downward.
- Storing an undirected road one way.
- Letting a worse duplicate edge overwrite a better one.
