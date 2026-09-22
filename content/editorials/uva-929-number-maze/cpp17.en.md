`weight` and `distance` share flat index `row*m+col`; division and remainder recover coordinates. Every one of four directions is bounds-checked before converting back, preventing horizontal wrap between rows.

`distance[0]=weight[0]` charges the start and handles a one-cell grid. Stale heap entries are discarded before the destination check. A candidate adds the neighbor's weight and enters the heap only when strictly smaller. The final destination distance is printed without adding any extra endpoint cost.
