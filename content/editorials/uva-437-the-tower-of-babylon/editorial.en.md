# Treat rotated block bases as a longest path in a strict order

## Problem and constraints

There are at most 30 block types, with unlimited copies of every type. Any dimension may be used as height. A block may sit above another only when both corresponding base dimensions are strictly smaller; equality is forbidden. Find the maximum tower height. Unlimited supply cannot create infinite height because every layer strictly shrinks both base dimensions.

## Building the approach

For each type, choose each of its three dimensions as height. Sort the remaining two dimensions into `x <= y` to give one canonical base orientation, producing at most `3N` states.

Think of a directed edge from a larger base to a strictly smaller base. Both dimensions decrease along every edge, so cycles are impossible. Sort states by `(x,y)` ascending and let `best[i]` be the tallest tower whose bottom block is orientation `i`.

Start `best[i]` at its own height. Every earlier orientation `j` with `x[j] < x[i]` and `y[j] < y[i]` can be the bottom of the tower placed above `i`, so update with `height[i] + best[j]`. The maximum over all possible bottoms is the answer.

## Walkthrough

For one type with dimensions 10, 20, and 30, unlimited copies allow a bottom block with base `20 x 30` and height 10, topped by another copy with base `10 x 20` and height 30, totaling 40. A `5 x 5 x 5` type cannot stack on itself because equal base sides fail the strict condition, so its best height remains 5.

## Why it works

Sorting the two base sides loses no placement: if any rotation pairs both sides successfully, matching shorter to shorter and longer to longer also satisfies both inequalities. Strict decrease makes the orientation graph acyclic. Any optimal tower with bottom `i` is either only `i`, or has a next orientation `j` with both smaller sides followed by an optimal tower rooted at `j`. The recurrence examines every such `j`; induction in sorted order therefore computes every `best[i]` and their global maximum.

## Complexity

With `V <= 3N` orientations, sorting takes `O(V log V)`, dynamic programming takes `O(V^2)`, and storage is `O(V)`.

## Common mistakes

- Treating each block type as available only once.
- Allowing equal base dimensions with `<=`.
- Comparing base area instead of both sides.
- Failing to normalize rotations of a base.
- Selecting only the tallest individual block.
