# A full hole may still be usable after rearranging earlier choices

## Problem and constraints

There are n gophers, m holes, s seconds before an eagle arrives, and running speed v; all four values are positive integers below 100. Each hole protects one gopher. Coordinates may be decimal, and arriving exactly at the deadline is safe. Maximize the number reaching different holes and print how many remain unprotected. Read cases until EOF.

## Building the approach

Separate geometry from allocation. A gopher can reach a hole exactly when their distance is at most sv. Make a bipartite edge for every such pair. Compare squared distances with `(sv)²`, avoiding square roots.

Now finding a reachable hole is not enough: several gophers may need the same one. A greedy choice can block a later gopher even when moving an earlier one would save both. Use augmenting paths. To place a gopher, try each reachable hole. If empty, take it. If occupied, first try moving its owner to another reachable hole; commit the new assignment only if that rearrangement succeeds.

Reset visited-hole marks for every new gopher. Within one search they prevent cycling through the same chain of assignments. For exact decimal boundaries, the reference reads coordinates as fractions and scales all of them to integers using a common denominator.

## Walkthrough

Gopher A can reach holes one and two, while B can reach only hole one. If A first takes hole one, B's search can move A to hole two and then occupy hole one. Both survive. A gopher exactly five units away with s = 1 and v = 5 has a valid edge: equality must be accepted.

## Why it works

The reachability graph contains exactly the feasible escapes. Assigning at most one hole per gopher and one gopher per hole is precisely a matching. An augmenting path alternates new choices with existing assignments and increases the matching size by one without conflict. If no such path exists for the next gopher, the maximum matching for the processed gophers cannot increase. Inductively processing all gophers gives the largest possible saved count. Common integer scaling preserves the distance comparison exactly.

## Complexity

Building the graph uses O(nm) distance comparisons. With E edges, simple augmenting-path matching takes O(nE) time and O(E + n + m) space. Exact arithmetic adds costs depending on coordinate digit lengths.

## Common mistakes

- Taking only currently empty holes without rearrangement.
- Counting every gopher with at least one reachable hole as safe.
- Rejecting deadline equality.
- Comparing squared distance with an unsquared threshold.
- Reusing visited marks across separate augmentation attempts.
