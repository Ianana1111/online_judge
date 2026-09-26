Each pending stack entry stores the current vertex, its parent, and cumulative weighted distance. Since the graph is a tree, skipping the parent is enough to prevent revisiting. Every outgoing road adds its actual length rather than one.

`solve` performs both farthest traversals, prints the second distance, and clears the graph. Both a blank line and EOF invoke the same logic; an empty graph is ignored so repeated separators do not create fake cases. The map avoids assuming consecutive labels, and every input road is inserted in both directions.

Road lengths have no specified upper bound. Decimal stores exact decimal integers, adds with right-to-left carries, and compares length before lexicographic order, avoiding 64-bit truncation of path totals.
