Create the root and follow every path, allocating unassigned intermediate nodes when needed. At the destination, a preexisting value marks the entire tree invalid, even if the repeated number is identical. A child may legitimately be read before its parent, so missing assignments cannot be rejected until `()`.

At the terminator, run BFS from the root. Any visited node without a value proves that some required ancestor was never assigned. Enqueue left before right to obtain the requested order. Collect the traversal before printing so that a late missing node cannot leave partial output.

Create intermediate nodes while reading each path, assigning a value only at the requested endpoint. At the tree terminator, BFS both checks that every created node has a value and yields level-order output.
