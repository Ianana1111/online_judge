Each initial `balance[v]` is the vertex's own marble count minus one. Reading edges fills both `children` and `parent`; the unique `-1` parent identifies the root independently of its label.

The forward `order` guarantees a parent precedes every child. The reverse loop intentionally stops before index zero, excluding the root. By the time `v` is processed, all descendant balances have already been included.

Only the move count uses the absolute value. The signed balance is added to the parent so supply and demand can cancel correctly. Since total marbles equal vertex count, the final root balance is zero.
