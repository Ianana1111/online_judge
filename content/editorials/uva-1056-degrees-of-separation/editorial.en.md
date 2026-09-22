# Compute every shortest relationship chain with Floyd–Warshall

## Problem and constraints

A network declares `P` people, with `2 <= P <= 50`, and undirected relationships between named members. The degree of separation of two people is the minimum number of relationships connecting them. Print the maximum such shortest distance, or `DISCONNECTED` if any pair cannot reach each other. `P` may exceed the number of names appearing in the relationship list; unnamed declared members still exist as isolated vertices.

## Building the approach

The requested value is the maximum over all-pairs shortest paths, not a longest simple path. Map encountered names to integer IDs and allocate a full `P` by `P` matrix. Set diagonal entries to zero, both directions of every relationship to one, and all other entries to a large infinity.

Run Floyd–Warshall. For each possible intermediate vertex `k`, update

`dist[i][j] = min(dist[i][j], dist[i][k]+dist[k][j])`.

After all intermediates are allowed, scan the entire declared matrix. Any infinity means the network is disconnected; otherwise the largest finite shortest distance is the answer. Rows belonging to unnamed members contain only their diagonal zero and therefore correctly expose them as isolated.

## Walkthrough

For a chain `A-B-C-D`, the shortest path from A to D has length three, and every other pair is no farther, so the answer is three.

If three people are declared but the only relationship is `A-B`, the unnamed third person remains isolated and the result is `DISCONNECTED`. A complete graph has answer one.

## Why it works

Before processing intermediate `k`, `dist[i][j]` is the shortest path whose internal vertices come only from earlier indices. After allowing `k`, an optimal path either avoids it or splits into an optimal `i`-to-`k` path and `k`-to-`j` path. The update chooses exactly these two possibilities.

Induction over `k` proves that the final matrix contains unrestricted shortest paths. Infinite entries represent unreachable pairs, while the greatest finite entry is precisely the maximum degree of separation requested.

## Complexity

Floyd–Warshall takes `O(P^3)` time and the matrix uses `O(P^2)` space. With at most fifty people, this is small.

## Common mistakes

- Searching for a longest path instead of the maximum shortest-path distance.
- Building the graph only from names that appear and omitting isolated declared people.
- Treating relationships as directed.
- Initializing unrelated pairs to zero.
- Omitting the required blank line after each network result.
