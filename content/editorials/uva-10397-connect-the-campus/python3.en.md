Consider the complete graph on buildings. Give every existing direct cable weight zero and every other pair its Euclidean distance. A minimum spanning tree in this weighted graph chooses the cheapest extra connections while freely using old cables. Existing cycles may remain physically present; the tree is only a tool for selecting a minimum-cost connecting subset.

Because the graph is dense, use the `O(N^2)` version of Prim rather than storing and sorting all edges. `best[v]` is the smallest squared cost of connecting unselected building `v` to the selected set. Repeatedly select the unvisited vertex with minimum `best`, add the square root of that value to the total, then update every remaining vertex. An existing edge supplies squared cost zero.

Squared distances are sufficient for comparisons because square root is increasing. Convert only an edge that Prim actually chooses, and round only the final sum.

Existing links are free, so treat them as zero-weight edges. Run Prim on the complete graph and add the selected edge cost whenever a new building enters the tree; free links are naturally preferred.
