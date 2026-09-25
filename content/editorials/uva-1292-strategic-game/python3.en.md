Add every input edge in both adjacency directions and root the tree arbitrarily at zero. Let `off[u]` be the minimum for `u`'s subtree when `u` is not selected, and `on[u]` when it is selected.

If `u` is off, each child `v` must be on to cover edge `(u,v)`, so add `on[v]`. If `u` is on, that edge is already covered and the child may use `min(off[v],on[v])`. Build a parent-first order iteratively and evaluate it backward so every child is ready before its parent.

Root the tree anywhere and process nodes in reverse traversal order. If a node is unguarded, each child must be guarded; if it is guarded, choose the cheaper guarded or unguarded state for each child.
