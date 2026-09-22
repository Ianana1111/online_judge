# Process serial numbers backward and keep the lightest stack per height

## Problem and constraints

Up to 1000 boxes appear in fixed serial order. A smaller serial cannot be placed above a larger one, so serial numbers increase from bottom to top. Each box has weight and maximum total weight it can support above itself; its own weight is excluded. Boxes may be skipped. Find the maximum stack height without reordering.

## Building the approach

Process boxes from largest serial to smallest. Already selected boxes form a legal upper stack, and the current smaller-serial box may be added only underneath it.

Let `best[h]` be the minimum total weight among legal upper stacks of height h using processed boxes. Initialize the empty stack with height zero and weight zero; all other states are unreachable.

If `best[h] <= load[i]`, box i supports that entire upper stack and creates height `h+1` with total weight `best[h]+weight[i]`. Keep the smaller weight for the new height. Update heights downward so the same current box cannot become both source and destination in one iteration.

Keeping only minimum weight is safe because a lighter stack of equal height is never harder for any later bottom box to support.

## Walkthrough

For two boxes `(weight 1, load 1)` then `(weight 1, load 0)`, the first can be bottom and the second top, giving height two. Reversing their load capacities leaves no legal height-two stack.

A single box with load zero is still usable because it supports the empty upper stack of weight zero; its own weight is not tested against its load.

## Why it works

Inductively, `best[h]` is the lightest legal height-h stack from processed serials. Skipping a box preserves every old state. Selecting it places it at the only legal new position, the bottom, and feasibility is exactly that its load covers the old total weight.

Any heavier stack of the same height cannot enable a transition that the lightest stack cannot, so discarding it loses no solution. Descending height uses each box at most once. These transitions cover all ordered subsets, making the greatest reachable height optimal.

## Complexity

Time is `O(N^2)` and DP space is `O(N)`, plus the input arrays.

## Common mistakes

- Sorting boxes and destroying serial order.
- Processing forward while still treating each new box as a bottom box.
- Including a box's own weight in its load test.
- Updating heights upward and reusing one box.
- Keeping the heaviest rather than lightest stack per height.
