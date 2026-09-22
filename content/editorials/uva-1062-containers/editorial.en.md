# Keep sorted stack tops and place each container by lower_bound

## Problem and constraints

Containers arrive as uppercase letters. Ships load in alphabetical order and only the top of a stack can be removed, so each stack must be nonincreasing from bottom to top. Find the minimum number of stacks needed for up to 1000 arrivals. Equal letters may share a stack, and the word `end` terminates input.

## Building the approach

Future legality depends only on each current stack top, not on deeper contents. Keep all top letters in sorted order. A new letter `ship` can be placed on a stack whose top is at least `ship`.

Among eligible stacks, choose the smallest top. This preserves larger tops for future large letters and is exactly the first position returned by `lower_bound`. Replace that top with `ship`; if no such position exists, append a new stack.

Replacing at the boundary preserves sorted order. Equality is allowed, which is why `lower_bound` rather than `upper_bound` is required. This process is also the tails algorithm for the strict longest increasing subsequence.

## Walkthrough

For `ABAC`, the first two letters create tops `A,B`. The next `A` replaces the first top without opening a stack. `C` exceeds every top and opens a third, so the answer is three.

`CCCCBBBBAAAA` fits in one stack because the arrival order is nonincreasing. An alphabetical sequence `A` through `Z` needs 26 stacks.

## Why it works

Any strictly increasing subsequence of arrivals cannot place two of its letters in the same nonincreasing stack, so the number of stacks is at least the strict LIS length.

The `lower_bound` update maintains the smallest possible final top for every represented subsequence length. Replacing with a no-larger top never harms future extensions; only a letter larger than all tops increases the length. Therefore the number of maintained tops equals the strict LIS length. Every greedy placement is also a legal stack operation, so it reaches the lower bound and is optimal.

## Complexity

Each arrival performs a binary search, for `O(N log S)` time where `S<=26`, and the tops use `O(S)` space.

## Common mistakes

- Using `upper_bound` and forbidding equal letters from sharing a stack.
- Sorting arrivals and changing their fixed order.
- Choosing an arbitrary eligible stack and wasting a more flexible top.
- Reversing the required within-stack order.
- Processing `end` as a container sequence.
