Treat students as vertices and same-religion pairs as undirected edges. Transitivity forces every connected component to share one religion. No constraint connects different components, so to maximize the count we may assign a different religion to each one. The answer is therefore the number of connected components.

Maintain components with a disjoint-set union. Initially every student is alone, so `groups=n`. For each pair, find the two roots. If they differ, merge them and decrement `groups`; if they are already equal, the edge adds no new constraint and the count stays unchanged.

Path compression and union by size keep operations almost constant time.

All three versions compress paths and merge by set size. The group count decreases only when two distinct roots are joined.
