# Solve Sudoku with bit masks and the fewest-candidates rule

## Problem and constraints

Each case is a 9 by 9 Sudoku. Zero denotes an empty cell, while digits 1 through 9 are fixed clues. Every row, column, and 3 by 3 box must contain no duplicate digit. The platform accepts any valid completion, including when multiple solutions exist, and prints `NO` only when no completion is possible. An input board may already contain conflicting clues.

## Building the approach

Blindly trying nine digits in every empty cell creates needless branches. Store used digits for each row, column, and box in nine-bit masks. A cell's legal candidates are the nine-digit universe minus the union of its three masks. While reading clues, detect duplicate bits immediately; fixed clues must never be changed.

At every recursive step, examine all remaining empty cells and choose one with the fewest candidates. A cell with no candidate proves the current branch impossible. Otherwise, try each candidate bit, place it in the grid and all three masks, recurse, then undo every change if the branch fails.

Finding one complete board is enough. The fewest-candidates rule changes only search order; it does not discard a legal digit.

## Walkthrough

If a cell's row is missing 1 and 2, but its column already contains 2 and its box permits 1, that cell has only candidate 1 and is an excellent next choice.

Two fixed fives in one row make the board invalid before search. Conversely, an empty board has many solutions; the solver should return the first valid completion rather than report `NO` because it is not unique.

## Why it works

Initially, validation guarantees that all fixed clues are mutually legal, and the masks exactly describe placed digits. Every attempted candidate is absent from its row, column, and box, so placing it preserves validity and never modifies a clue.

For the chosen empty cell, any full solution must use one of the candidate bits. The recursion tries all of them, and restoration keeps branches independent. A zero-candidate cell cannot be extended. When all empty cells are filled, each group of nine contains nine distinct values from 1 through 9 and is therefore a full valid set. If all branches fail, every possible legal assignment has been exhausted.

## Complexity

With `E` empty cells, worst-case search remains exponential, conservatively `O(E*9^E)`. Candidate masks are constant-size, and storage is `O(81+E)` including recursion. The heuristic greatly improves typical behavior without changing the worst-case class.

## Common mistakes

- Altering a fixed clue to manufacture a solution.
- Checking rows and columns but forgetting boxes.
- Failing to restore a grid value or mask bit during backtracking.
- Treating multiple solutions as no solution.
- Declaring the whole puzzle impossible after only one candidate branch fails.
