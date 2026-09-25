Root the tree at station 1. Compute every distance from the root, the total visit frequency in each subtree, and the root's one-way weighted distance sum. Let `total` be total demand and `subtree[v]` be demand inside child `v`'s subtree.

When home moves across an edge of length `w` from parent `u` to child `v`, all `subtree[v]` visits become `w` closer and all other visits become `w` farther. Therefore `cost[v]=cost[u]+w*(total-2*subtree[v])`. Applying this formula parent before child obtains every cost in linear time. Minimize the one-way values, then double only the printed annual time.

Compute distances from an arbitrary root to obtain its total travel cost. Accumulate visit frequencies by subtree, then reroot across each edge: the one-way cost changes by edge length times total visits minus twice the child subtree visits.
