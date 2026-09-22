# Decide whether the game is lost before drawing the board

## Problem and constraints

You receive a mine map and a map of touched cells for a square board of size at most 10. A touched safe cell displays the number of mines in its eight neighboring positions. Untouched safe cells remain dots. If any touched cell contains a mine, reveal **every** mine, including untouched ones. Separate test-case outputs with a blank line; a zero count is printed as `0`.

## Building the approach

The output for one cell sometimes depends on another cell far away: an untouched mine must be revealed if the player touched any mine elsewhere. Printing while discovering the loss can therefore leave earlier mines incorrectly hidden.

Split the work into two passes. First determine one global Boolean, `lost`, by checking whether any cell is both touched and mined. Then decide what to print for every cell using that completed information.

The order of the display rules matters. If the game is lost and this cell is mined, print a star. Otherwise, if it is untouched, print a dot. Every remaining cell is touched and safe, so count its eight neighbors, excluding positions outside the board.

## Walkthrough

On a one-cell board, an untouched mine stays hidden, a touched mine becomes `*`, and a touched safe cell becomes `0`. On a two-by-two board containing two mines, touching either mine reveals both. Untouched safe cells still remain dots; losing does not reveal the entire safe-cell count map.

## Why it works

The first pass sets `lost` exactly when at least one mine was touched. The second pass's first rule reveals precisely all mines in that situation. Its next rule hides untouched cells, and its final rule handles only touched safe cells. The eight nonzero offsets in a three-by-three neighborhood enumerate every adjacent position once; bounds checks remove positions outside the board.

## Complexity

O(n²) time, since each cell checks at most eight neighbors. The two stored maps use O(n²) space.

## Common mistakes

- Revealing only the mine that was touched.
- Missing diagonal neighbors or counting the cell itself.
- Discovering a loss after earlier cells were already printed.
- Revealing numbers on untouched safe cells.
- Printing a blank instead of zero or omitting case separators.
