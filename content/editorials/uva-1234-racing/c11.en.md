Trying to list every cycle is an awkward start: there can be many of them, and two cycles may share the same camera. Instead, imagine driving only on roads without cameras. If those roads contain a cycle, that cycle escapes every camera. Therefore the roads we leave unmonitored must form a forest.

This changes the optimization question. The total cost of all roads is fixed. Paying as little as possible means leaving as much road cost as possible unpaid. We want a **maximum-weight forest**, not a minimum spanning tree.

Because the graph is connected and every cost is positive, a forest with several components can always gain another connecting road and increase its weight. The best forest is consequently a maximum spanning tree. Run Kruskal in descending cost order: keep a road when it joins two different components; otherwise put a camera on it and add its cost to the answer.

Roads without cameras must be cycle-free. Consider roads from most expensive to least, keep each edge that joins two components, and add the cost of every rejected edge to the answer.
