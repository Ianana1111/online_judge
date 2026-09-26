The unique simple path between every pair of villages tells us the road network is a tree. The greatest pairwise distance is its diameter, obtainable with two traversals.

Start at any village and accumulate road lengths along the unique paths, finding a farthest village a. In a positive-weight tree, a farthest vertex is an endpoint of a diameter. Traverse again from a to its farthest village b; that distance is the diameter. The first traversal's distance alone need not be the diameter.

`farthest` stores the current village, its parent, and accumulated distance. Avoiding the parent is sufficient in a tree. An explicit stack handles a 10000-village chain without deep recursion. A blank line ends a dataset; EOF must also flush the final one. Consecutive blank lines produce no empty answer.

Each traversal examines every edge twice, taking O(V) time and O(V) space, excluding integer lengths. The statement gives no upper bound on road lengths, so exact integer arithmetic prevents path-total overflow.
