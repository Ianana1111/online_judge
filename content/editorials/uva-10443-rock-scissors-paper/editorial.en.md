# Simulate every day from an unchanged snapshot

## Problem and constraints

Each cell of a rectangular board contains rock `R`, scissors `S`, or paper `P`. Every day, edge-adjacent cells fight: rock beats scissors, scissors beats paper, and paper beats rock. All conquests of one day occur simultaneously. Print the board after the requested number of days, with a blank line between test cases. Rows, columns, and days are at most 100; zero days leaves the board unchanged.

## Building the approach

The word “simultaneously” requires separate old and new boards. At the start of each day, copy `grid` to `next`. For each cell, determine the one species that defeats its current species: paper defeats rock, scissors defeats paper, and rock defeats scissors.

Inspect only the four edge neighbors in the old `grid`. If any contains that enemy, write the enemy into the corresponding cell of `next`; otherwise the copied value remains. After every cell has been decided from the same old snapshot, swap the boards.

There is no conflict when several neighbors defeat one cell because each species has exactly one enemy, so all winning neighbors have the same value.

## Walkthrough

For the one-row board `RSP`, the next day is `RRS`. The first rock has no adjacent paper and remains. The scissors is defeated by the original rock on its left. The paper is defeated by the original scissors on its left.

If the middle cell were overwritten first and its new rock used immediately, the final paper would wrongly survive. A one-cell board never changes because it has no neighbors.

## Why it works

Assume `grid` is the correct state at the beginning of a day. A cell can be conquered only by one of its four legal neighbors, and only a neighbor of its unique defeating species wins. The algorithm checks all and only those positions, so it assigns exactly the correct next-day species for that cell.

Every decision reads the unchanged old grid, so `next` contains all results of the same simultaneous day. The input supplies the correct day-zero state; induction over the number of swaps proves the final board is correct.

## Complexity

For `D` days on an `R` by `C` board, time is `O(DRC)` and the two boards use `O(RC)` space.

## Common mistakes

- Updating in place and allowing same-day conquest to propagate.
- Including diagonal neighbors or wrapping board edges.
- Reversing the dominance cycle.
- Running one iteration when the day count is zero.
- Omitting the blank line between test cases.
