# Follow parity of the ball's local visit number at each node

## Problem and constraints

In a complete binary tree, root depth and index are one, with left child `2x` and right child `2x+1`. Every internal flag starts false; a visiting ball toggles it and travels left on the old false value or right on old true. Given depth `D` and ball number `I`, find its leaf. Here `2 <= D <= 20`, `I` is at most the leaf count, and flags reset for every case.

## Building the approach

At any node, its first, third, fifth, and other odd visits go left; even visits go right. If the target is local visit `I`, an odd value travels left and becomes visit `(I+1)/2` in that left subtree. An even value travels right and becomes visit `I/2` there.

Start at node one and repeat this rule for exactly `D-1` edges, updating both node index and local visit number. Keeping the original global `I` at every level would be wrong because only about half of all balls enter the selected subtree.

This computes the target path without simulating earlier balls or allocating flag storage.

## Walkthrough

For `D=4,I=2`, the root's second visit goes right to node 3 and becomes local visit one; two odd visits then go left to nodes 6 and 12. For ball three, the path is left as local visit two, right as local visit one, then left, reaching node 10. Ball one always travels left to leaf `2^(D-1)`.

## Why it works

Because every visit toggles the flag, odd visits at a node see false and go left, while even visits see true and go right. Among the first `I` visits, the left child receives `ceil(I/2)` and the right `floor(I/2)`, which is exactly the target's new local index in its selected child. Applying this invariant level by level tracks the real ball position; after `D-1` moves that position is its leaf.

## Complexity

Each case follows `D-1` levels in `O(D)` time and `O(1)` space, independent of `I`.

## Common mistakes

- Reusing the original global `I` at every level.
- Rounding an odd left visit down with `I/2`.
- Descending `D` edges instead of `D-1`.
- Treating the root as depth zero.
- Sharing flag state between independent test cases.
