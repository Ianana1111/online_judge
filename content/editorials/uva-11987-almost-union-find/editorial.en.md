# Give a moved element a fresh DSU node

## Problem and constraints

Start with singleton sets over values 1 through `n`. Support union of sets containing `p,q`, moving only element `p` into `q`'s set, and querying set size and value sum. Up to 100,000 elements and commands occur per EOF-delimited case. Ordinary DSU cannot safely reparent a node with descendants when moving one logical element.

## Building the approach

Separate logical elements from structural nodes. `id[p]` points to the DSU node currently representing element `p`. Union roots normally, maintaining valid-element `size` and `sum`, while a separate structural `weight` supports union by size including historical nodes.

To move `p`, subtract one and value `p` from its old root and add them to the destination root. Allocate a fresh node as a leaf attached to that destination and update `id[p]`. Leave the old node in its old tree as a ghost with no logical identity; descendants and other elements remain untouched. At most one node is allocated per move, so `n+m+1` capacity suffices.

## Walkthrough

After uniting 1,2,3, move 1 into 4's set. Correct sets are `{2,3}` and `{1,4}`. If node 1 happened to be a DSU root, directly changing its parent could incorrectly carry 2 and 3. A fresh node changes only `id[1]`, while the old tree still supports the other elements.

## Why it works

Maintain the invariant that the root of `id[p]` is exactly p's logical set and root statistics count only live elements. Union links roots and adds both statistics, preserving it. Move modifies statistics by exactly p's contribution and redirects only p's identity to a new leaf, leaving all other parent chains unchanged. Ghost nodes are never counted as elements. Queries at `root(id[p])` therefore return exact set size and sum.

## Complexity

At most `n+m` DSU nodes exist. Path compression and union by structural weight give amortized `O(alpha(n+m))` per operation and `O(n+m)` space. Sums require 64 bits.

## Common mistakes

- Reparenting p's old node and moving its descendants.
- Forgetting size or sum updates on either root.
- Counting ghost structural nodes as live elements.
- Allocating or adjusting on same-set moves.
- Storing set sums in 32 bits.
