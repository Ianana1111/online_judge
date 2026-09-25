Scan every grid cell. Finding an unvisited `@` proves that a previously uncounted component has been reached, so increment the answer and launch a stack-based traversal. Visit every oil neighbor in all eight directions and change it to `*` as soon as it is pushed.

Marking at discovery time prevents the same cell from being pushed by several neighbors. Generate neighbors with row and column offsets from -1 through 1, excluding `(0,0)`. Bounds must be checked before indexing.

After the traversal removes the entire component, the outer scan cannot count any of its other cells again.

For each unvisited oil cell, traverse its full eight-neighbor component and mark it empty. The outer scan then counts that deposit only once.
