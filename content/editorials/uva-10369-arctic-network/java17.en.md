Imagine proposing a maximum radio range `D`. Keep every pair of outposts whose Euclidean distance is at most `D`. The range is feasible exactly when this graph has at most `S` connected components, since one satellite channel can serve each component.

Kruskal processes all pair distances from smallest to largest, which reveals the first range at which the component count falls from `P` to `S`. Start with every outpost separate and union endpoints of increasing edges. Each successful union reduces the count by one, so after `P-S` unions the current edge length is the minimum feasible threshold.

Store squared Euclidean distances. Square root is increasing, so their order is identical to the true-distance order, and all comparisons remain exact integers. Take one square root only for the final answer. Equivalently, this constructs an MST and removes its `S-1` largest edges.

Sort squared distances and run Kruskal. The edge that first reduces the component count to S is the minimum necessary radio range; take its square root only for final output.
