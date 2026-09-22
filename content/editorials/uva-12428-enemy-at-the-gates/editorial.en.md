# Concentrate excess edges in the smallest bridgeless core

## Problem and constraints

Among connected undirected simple graphs with `N` vertices and `M` edges, find the maximum possible number of bridges. `N` is at most 100,000 and `M` may approach five billion, so 64-bit arithmetic is required.

## Building the approach

A connected graph first needs `N-1` tree edges; let `E=M-(N-1)` be the excess. Concentrate every cycle-producing edge in a core of `k` vertices and attach the other `N-k` vertices as a tree, leaving `N-k` bridges. A `k`-vertex core can hold at most `C(k,2)-(k-1)=(k-1)(k-2)/2` excess edges.

Binary-search the smallest `k` whose capacity is at least `E`; the answer is `N-k`. For `E=0`, `k=1` correctly gives a tree's `N-1` bridges.

## Walkthrough

For `N=4,M=3`, there is no excess and all three tree edges may be bridges. For `M=4`, one excess edge needs a three-vertex triangle core, leaving one outside bridge. A complete graph requires every vertex in the core and leaves zero bridges.

## Why it works

Deleting `b` bridges creates `b+1` components. Convexity of `C(s,2)` shows their internal-edge capacity is greatest when all non-singleton vertices are concentrated in one component of size `N-b`. Hence `M<=b+C(N-b,2)`, which becomes `E<=(k-1)(k-2)/2` for `k=N-b`, proving the upper bound. A cycle through the minimum core plus arbitrary extra internal edges, with all remaining vertices attached as a tree, attains that bound.

## Complexity

Each case takes `O(log N)` time and `O(1)` space.

## Common mistakes

- Reading `M` in 32 bits.
- Using total core capacity instead of excess capacity.
- Requiring strict inequality at an exact capacity boundary.
- Forcing a three-vertex core when the graph is a tree.
