# Separate one-row, two-row, and ordinary knight boards

## Problem and constraints

Place the maximum number of nonattacking knights on an `M` by `N` board, with dimensions up to 500. Input ends only at `0 0`; a board with one zero dimension has no cells and answer zero. Preserve the original row and column order in the output sentence.

## Building the approach

Let `a` be the shorter side and `b` the longer. If `a=0`, answer zero. If `a=1`, no knight move fits, so every cell may be occupied.

If `a=2`, the optimal pattern repeats every four columns: fill two consecutive columns completely, then leave two empty. Each full block contributes four knights. A remaining one column contributes two; two or three columns contribute four. This is

`4*(b/4) + min(4, 2*(b%4))`.

When both dimensions are at least three, color the board like a chessboard. Knights always move between colors, so filling the larger color class constructs `ceil(MN/2)` nonattacking knights; the pairing argument in the verified Chinese proof supplies a matching upper bound, making this value optimal.

## Walkthrough

A `2x3` board holds four knights, exceeding the ordinary half-area value three. A `2x6` board has one full four-column block plus a two-column remainder, giving `4+4=8`. A `5x5` board has color classes of 13 and 12 cells, so the answer is 13.

## Why it works

On one row, no pair can realize a `(1,2)` displacement. On two rows, every four-column block has an attainable four-knight pattern and an attack-pair upper bound of four; each possible remainder has the formula's matching construction and bound. For larger boards, filling one color is safe because every knight edge joins opposite colors, while disjoint attack-pair certificates cover `floor(MN/2)` pairs and limit any independent placement to `ceil(MN/2)`. Each case's construction meets its upper bound, proving optimality.

## Complexity

Every case uses `O(1)` arithmetic and `O(1)` extra space.

## Common mistakes

- Applying half the area to a one- or two-row strip.
- Adding six knights for a three-column remainder on a two-row board.
- Rounding an odd ordinary board down.
- Swapping dimensions for output after normalizing them for computation.
- Treating a zero dimension as the one-row case.
