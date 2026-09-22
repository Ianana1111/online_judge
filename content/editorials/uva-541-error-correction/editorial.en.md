# Find what a single flipped bit can change

## Problem and constraints

Every row and column of an N by N binary matrix should contain an even number of ones. Print `OK` if this already holds. Otherwise, if flipping one bit can fix the matrix, print its one-based coordinates; if not, print `Corrupt`. N < 100, and a zero size ends the input. A flip can change either zero to one or one to zero.

## Building the approach

You could try flipping each cell and checking the entire matrix again. Before doing that, ask what a single flip actually affects. It toggles the parity of exactly one row and exactly one column; every other row and column stays unchanged.

That observation tells us what information to collect. For each row and column, retain only whether its number of ones is odd. XOR is enough: every one toggles the value, so a final one means odd parity.

If no row or column is odd, no correction is needed. If exactly one row and one column are odd, their intersection is the only possible repair. In all other cases, one flip cannot repair every violation. Notice that we did not need to remember the original matrix at all.

## Walkthrough

A one-cell matrix containing zero is already valid. If it contains one, its only row and column are both odd; flipping `(1,1)` fixes both.

Now put ones on the diagonal of a two-by-two matrix and zeros elsewhere. Two rows and two columns are odd. A flip changes just one of each, so at least one odd row remains. The result is `Corrupt`, not two independent single-bit repairs.

## Why it works

The XOR accumulators report every row and column's parity correctly. Flipping the intersection of the unique odd row and unique odd column changes those two to even without changing any other parity. Conversely, if one flip repairs the matrix, all originally odd rows and columns must be the row and column touched by that flip. This proves both the sufficiency and necessity of the condition.

## Complexity

Reading the matrix takes O(N²) time; the final parity scan takes O(N). Two parity arrays and the odd-index lists use O(N) space.

## Common mistakes

- Checking only rows or only columns.
- Assuming any nonzero number of odd rows is repairable.
- Always changing a bit even when the matrix is already valid.
- Printing zero-based coordinates or changing the required punctuation.
