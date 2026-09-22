# Map one distinct route to positions and reduce LCS to LIS

## Problem and constraints

The prince and princess each visit a sequence of distinct squares on an `n*n` board. Find the longest route that preserves the order of both sequences. `n<=250`, so a route can contain 62500 squares. Input values `p` and `q` count jumps; the actual route lengths are `p+1` and `q+1`.

## Building the approach

A quadratic LCS table is too large. The crucial property is that every square occurs at most once in the prince's route. Store `position[value]`, its unique index there.

Read the princess's route in order. Ignore squares absent from the prince's route and replace every common square by its prince position. The princess order is already preserved by this scan. Selecting a sequence whose mapped positions strictly increase also preserves prince order, so the answer is the LIS length of the mapped sequence.

Maintain `tails`, where `tails[k]` is the smallest possible final position of an increasing subsequence of length `k+1`. Use `lower_bound` to replace the first tail not smaller than the new position, or append if none exists. A smaller tail preserves the attainable length while leaving more room for future positions.

## Walkthrough

If the prince visits `1,7,5,4,8,3,9`, their positions are zero through six. Filtering princess route `1,4,3,5,6,2,8,9` and mapping it gives `0,3,5,2,4,6`. An increasing subsequence `0,3,4,6` corresponds to common route `1,4,8,9`, of length four.

The output counts visited squares, not the three jumps between these four squares.

## Why it works

Every common square has one unique prince position. A common subsequence preserving both routes maps to a strictly increasing position sequence. Conversely, any increasing mapped subsequence occurs in princess scan order and prince position order, so it maps back to a valid common subsequence. This is a bijection.

The tails invariant stores the minimum possible ending position for each attainable length. Replacing the first tail at least as large creates a subsequence of the same length with a no-worse ending; appending proves a longer subsequence. Therefore `tails.size()` is the LIS length and, by the bijection, the desired LCS length.

## Complexity

For route lengths `P` and `Q`, position construction takes `O(n^2+P)` initialization/read work and LIS processing takes `O(Q log P)`. Space is `O(n^2+P)`.

## Common mistakes

- Reading only `p` or `q` squares instead of `p+1` and `q+1`.
- Counting common values without preserving order.
- Running LIS on square labels rather than prince positions.
- Treating the tails array itself as the reconstructed route.
- Subtracting one and outputting jumps rather than squares.
