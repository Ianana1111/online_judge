# Let each vertex accept its first K walk arrivals

## Problem and constraints

In a directed graph with nonnegative edge weights, find the length of the `K`th shortest walk from source to target. Walks may repeat vertices and edges, may leave the target and return, and equal-length but different edge sequences occupy separate ranks. Parallel input edges are distinct choices. `N<=100`, `M<=1000`, `2<=K<=10`; print `-1` if fewer than K walks exist.

## Building the approach

Ordinary Dijkstra finalizes each vertex once, but here several different prefixes reaching the same vertex can lead to different ranked complete walks. Treat every heap record `(distance,u)` as one concrete walk prefix. Start with the empty source walk at distance zero.

Pop records in nondecreasing distance. Accept and expand at most K arrivals per vertex; later arrivals are discarded. When the target is accepted for the Kth time, that distance is the answer. The first K-1 target arrivals must still be expanded, because a legal walk may reach the target, follow a cycle, and return.

Do not deduplicate equal distances. Zero-weight cycles can create many distinct walks with the same length, but the K-arrival cap still guarantees finite expansion.

## Walkthrough

Suppose source one has an edge of length five to target two, and target two has a self-loop of length two. Target walk lengths are 5, 7, 9, 11, so the third is nine. Stopping or refusing expansion at the first target arrival would miss it.

If the source has a zero self-loop and an edge of length seven to the target, different loop counts create arbitrarily many length-seven walks. The tenth shortest length is still seven.

## Why it works

Nonnegative weights ensure heap pops never move backward in accumulated length. If a vertex already has K prefixes no longer than a later prefix, then appending any fixed suffix to those K prefixes creates K distinct complete walks no longer than the one using the later prefix. Thus a prefix after the Kth accepted arrival cannot be necessary for any top-K result.

Starting from the empty source prefix and extending every accepted prefix enumerates all walks except those safely dominated by K no-longer prefixes at the same vertex. Therefore the target's accepted arrivals are exactly its first K ranked walks, including multiplicity at equal cost. If the heap empties early, no omitted prefix could create a missing top-K walk.

## Complexity

Each vertex expands at most K times and each edge generates at most K heap records. Time is `O(KM log(KM))` and extra space is `O(KM+N+M)`.

## Common mistakes

- Finalizing each vertex once as in ordinary shortest path.
- Removing equal-length records and finding distinct lengths instead of walks.
- Stopping at the first target arrival.
- Treating the target as terminal and not expanding its outgoing edges.
- Requiring simple paths with no repeated vertices.
- Leaving arrivals uncapped and looping on a zero-weight cycle.
