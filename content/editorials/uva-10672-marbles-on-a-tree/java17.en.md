For a subtree, define

`balance = current marbles - number of vertices`.

A positive balance must leave through its parent edge; a negative balance must enter through that edge. Because this is the subtree's only connection to the outside, at least `abs(balance)` marbles must cross that edge.

Read child lists, construct parent links, and locate the vertex without a parent. Build any order with parents before children, then process it in reverse. Initialize each vertex with `own marbles-1`. Once all children have contributed, add `abs(balance[v])` to the answer and add the signed balance to its parent. Skip the root because it has no outside edge.

An explicit order avoids recursion depth on a chain of ten thousand vertices.

Each subtree ultimately needs one marble per vertex, so its surplus or deficit must cross its unique parent edge. Traverse from root to leaves, then process that order backward to accumulate balances and moves.
