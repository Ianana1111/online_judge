# Sort for the dependency order, then reconstruct a strict chain

## Problem and constraints

Up to 1,000 elephants have weights and intelligence values between 1 and 10,000. Their IDs are their one-based input line numbers. Find a longest sequence with strictly increasing weight and strictly decreasing intelligence, then print its length and original IDs. Equal weights, equal intelligence, and duplicate pairs may occur. Any longest valid sequence is accepted.

## Building the approach

Sorting by weight puts every possible predecessor before its successor. It does not make equal weights legal: the transition must still check both strict inequalities.

Let `length[i]` be the longest chain ending at sorted elephant i. A single elephant always works, so start at one. For every earlier j with smaller weight and larger intelligence, try extending its best chain to length `length[j] + 1`.

The task asks for the chain itself, not just its length. Whenever a transition improves the value, save j as `previous[i]`. Choose the best ending elephant, follow predecessors backward, and reverse the collected original IDs. Keep the original ID attached during sorting; a sorted array index is not an output ID.

## Walkthrough

For input pairs `(1,9), (2,8), (2,8), (3,7)`, the maximum length is three. IDs `1,2,4` and `1,3,4` are both valid. The two middle elephants cannot appear together because both their weight and intelligence are equal. The judge must accept either optimal chain.

## Why it works

Every legal predecessor has lower weight and therefore appears earlier after sorting. Any chain ending at i is either the singleton or extends a chain ending at such a predecessor. Taking the maximum over those possibilities gives the optimum for i. Saved predecessors come only from valid improvements, so reconstruction preserves the strict conditions and yields the reported length. Maximizing over endpoints gives a global optimum.

## Complexity

O(N log N) sorting, O(N²) dynamic programming, and O(N) reconstruction. Extra space is O(N); the quadratic work is sufficient for N ≤ 1,000.

## Common mistakes

- Allowing equal weights or intelligence values.
- Assuming sorting alone enforces strictness.
- Printing sorted indices rather than original IDs.
- Forgetting to reverse the reconstructed chain.
- Reporting an optimal length alongside a different, shorter chain.
