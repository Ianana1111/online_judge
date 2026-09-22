# Enumerate the first row, then let every later press be forced

## Problem and constraints

The board is always 10 by 10. `O` is an on light and `#` is off. Pressing a cell toggles itself and its existing up, down, left, and right neighbors. For every named board, find the minimum number of presses that turns every light off. The name `end` terminates input. Pressing one cell twice cancels itself, so an optimal solution never needs more than one press per cell.

## Building the approach

Treating all one hundred buttons independently would suggest `2^100` possibilities. Instead, work from top to bottom. Nothing above the first row can determine its presses, so enumerate its 1024 possible press masks. After that choice, every later row is forced.

Once we finish deciding presses in row `r`, any light still on in that row can only be fixed by pressing the cell directly below it. Returning to earlier rows would disturb already settled lights, and no other later button reaches row `r`. Therefore the remaining state of row `r` is exactly the press mask required for row `r+1`.

Store each board row as a ten-bit mask. For a current press mask, its effect within the row is the mask itself plus its left and right shifts; the previous row's presses supply the vertical effect from above. XOR these effects with the original light mask to derive the next required mask. After processing the tenth row, a nonzero requirement for an imaginary eleventh row means the chosen first row is impossible.

## Walkthrough

An all-dark board succeeds with the all-zero first mask and requires zero presses. If a board was created by toggling exactly one button's cross, pressing that same button once restores darkness.

The public all-on board needs 44 presses. Regardless of the board, it is not enough to clear only the first nine rows: the final derived mask must be zero because there is no row below the board to apply it.

## Why it works

Button effects combine by XOR, so press order does not matter and pressing twice is equivalent to not pressing. Enumerating binary choices therefore covers every potentially optimal first-row decision.

Fix one such decision. For each row in order, a lit cell can be affected by exactly one still-undecided button: the button immediately below it. Hence the next-row press mask is uniquely necessary, and applying it clears the current row. By induction, the sweep produces the only full-board press pattern compatible with the chosen first row. It is valid exactly when no press is required below row ten. Every valid solution appears under its own first-row mask, so taking the minimum press count over all valid sweeps yields the global optimum.

## Complexity

There are `2^10` first-row masks and ten rows per sweep, each handled with constant-width bit operations. Time is `O(2^10 * 10)` and extra space is `O(10)` for the row masks.

## Common mistakes

- Trying only an empty first-row press pattern.
- Forgetting to count the presses made in the first row.
- Failing to mask a left shift back to ten bits.
- Accepting a pattern that clears nine rows but leaves the last row on.
- Combining toggle effects with OR instead of XOR.
- Searching all one hundred buttons independently.
