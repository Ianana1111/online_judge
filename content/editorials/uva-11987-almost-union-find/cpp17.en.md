Arrays allocate `n+m+1`, and `used` starts at `n`; only a real cross-set move increments it. Queries always call `root(id[p])`, following the element's newest structural representative.

`size` and `sum` are meaningful at roots and count live elements. `weight` instead counts structural nodes, including ghosts and new leaves, preserving the union-height guarantee. A new leaf's own statistics may stay zero because it immediately points to destination root. `sum` uses `long long` and move arithmetic uses logical value `p`.
