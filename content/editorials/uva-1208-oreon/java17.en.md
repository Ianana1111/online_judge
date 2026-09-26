We want every city connected while assigning as few guards as possible. A cycle is unnecessary: deleting one of its edges preserves connectivity. An optimum can therefore be a spanning tree with exactly n−1 edges.

Kruskal considers roads from cheapest to most expensive. If the endpoints are already connected, the road would create a cycle; otherwise join their components. Why is this greedy choice safe? The cheapest road crossing between components can replace a more expensive crossing in a spanning tree without losing connectivity. Repeating this exchange argument yields a minimum spanning tree.

Read only the upper half of the symmetric matrix to avoid duplicate undirected roads. Zero means no road, not a free road. A disjoint-set parent array identifies components, and path compression makes later find operations faster.

No weight bound is stated, so C/C++ compare canonical decimal strings by length and then lexical order; Java uses BigInteger. We only sort and print weights, so arithmetic is unnecessary. Both commas and whitespace separate tokens. Endpoint tie breakers make the presentation deterministic, though any minimum spanning tree is valid. Sorting takes O(E log E), plus digit-comparison costs, with O(E+n) storage.
