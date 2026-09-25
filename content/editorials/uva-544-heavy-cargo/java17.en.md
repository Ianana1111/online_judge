Let `best[v]` be the largest bottleneck capacity found from the source to `v`. Give the source a value above every legal edge, 10001, and other cities zero. Repeatedly choose the unsettled city with largest `best`.

Extending through `u` to `v` creates capacity `min(best[u], capacity[u][v])`, since the narrower of the existing route and new road limits the cargo. Keep the maximum of this candidate and the old `best[v]`. This is the widest-path analogue of Dijkstra: select maximum labels and combine a path with an edge using minimum.

For parallel roads, store their maximum individual capacity. One shipment may choose the better road but cannot add both capacities.

A route carries at most its narrowest road, while among routes we choose the largest bottleneck. Settle the city with the highest current capacity and relax neighbors using max(old, min(current capacity, road limit)).
