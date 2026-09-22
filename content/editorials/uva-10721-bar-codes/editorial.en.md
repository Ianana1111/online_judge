# Count bounded ordered width compositions with dynamic programming

## Problem and constraints

A barcode begins black and alternates colors for exactly `K` bars. Total width is `N`, and every bar has integer width from one through `M`. Count distinct ordered width sequences. `N,K,M` are at most fifty, input continues to EOF, and answers fit signed 64-bit. The fixed starting color does not add a factor of two.

## Building the approach

Colors are completely determined by bar position, so choose only the widths: `K` positive ordered integers, each at most `M`, summing to `N`.

Let `ways[bars][total]` count sequences using exactly `bars` widths with the given total. The unique empty sequence gives `ways[0][0]=1`. For a nonempty sequence, classify by its final width `width` from one through `M`; the preceding bars must form `total-width`. Therefore

`ways[bars][total] = sum ways[bars-1][total-width]`.

Widths begin at one because a zero-width bar would disappear and change the number of bars.

## Walkthrough

For `N=4`, `K=2`, `M=3`, valid widths are `(1,3)`, `(2,2)`, and `(3,1)`, giving three. The first and last are different barcodes because order matters.

If `K>N`, positive widths cannot fit. If `N>K*M`, maximum widths are insufficient. Both cases naturally remain zero in the table.

## Why it works

Every valid barcode has exactly one final width. Removing it leaves a valid sequence with one fewer bar and the corresponding remaining total. Conversely, appending that width to any counted subproblem yields one valid barcode.

Different final widths define disjoint cases and together cover all legal barcodes. Starting from the unique empty sequence, the recurrence therefore counts each ordered width sequence exactly once.

## Complexity

Time is `O(KNM)` and table space is `O(KN)`. Counts use `long long` because valid results may exceed 32-bit range.

## Common mistakes

- Allowing zero width and counting fewer than K visible bars.
- Treating widths as an unordered integer partition.
- Multiplying by two even though the first bar is fixed black.
- Omitting the `ways[0][0]=1` base case.
- Storing counts in 32-bit integers.
