`nodes[0]` is the virtual root. Each `Node` stores a map from a child name to that child's index in `nodes`; indices remain meaningful when the vector grows.

The inner `getline` splits a path on the backslash character. For a new child, the program records the next vector index, updates the parent's map, and then appends a node. It does not keep a reference into the vector across that append, which could reallocate storage. After either creating or finding the child, `u` advances to it.

`printTree` iterates over the ordered map, prints `depth` spaces and the child name, and recurses with `depth + 1`. The initial call uses depth zero because it prints the root's children, not the root itself. A separate newline ends each case.
