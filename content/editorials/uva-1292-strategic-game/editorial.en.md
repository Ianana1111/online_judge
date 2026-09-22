# Solve the tree's minimum vertex cover with two states per node

## Problem and constraints

An undirected tree with up to 1,500 vertices represents roads. A soldier placed at a vertex watches every incident edge. Find the minimum soldiers covering every edge, which is the tree minimum vertex cover. Input lists each edge once in arbitrary endpoint rows and continues to EOF. A single isolated vertex needs zero soldiers.

## Building the approach

Add every input edge in both adjacency directions and root the tree arbitrarily at zero. Let `off[u]` be the minimum for `u`'s subtree when `u` is not selected, and `on[u]` when it is selected.

If `u` is off, each child `v` must be on to cover edge `(u,v)`, so add `on[v]`. If `u` is on, that edge is already covered and the child may use `min(off[v],on[v])`. Build a parent-first order iteratively and evaluate it backward so every child is ready before its parent.

## Walkthrough

A star needs only its center, while selecting all leaves is more expensive. A single vertex has states zero and one, so the answer is zero. A four-vertex path needs two selected vertices; the recurrence covers edges without requiring every vertex itself to be watched.

## Why it works

For a leaf, off costs zero and on costs one. Assuming child states are optimal, an unselected parent forces every child selected, which is both necessary and sufficient for their connecting edges. A selected parent frees each independent child subtree to choose its cheaper state. Trees have no edges between child subtrees, so costs add without conflict. Induction proves both states, and the root has no parent constraint, so their minimum is globally optimal.

## Complexity

Building, traversing, and evaluating the tree take `O(n)` time and `O(n)` space.

## Common mistakes

- Treating input rows as directed parent-child relations.
- Allowing both endpoints of an edge to remain unselected.
- Forcing children selected even when the parent is selected.
- Solving vertex domination rather than edge cover.
- Assigning one soldier to an isolated vertex.
