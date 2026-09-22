# Anchor the next tile at the first empty cell and memoize inventory

## Problem and constraints

Use every supplied rectangular tile to cover a `W x H` board exactly and count distinct placement patterns. Tiles may rotate 90 degrees; identical tiles in one similarity group are unlabeled. This platform keeps the original dimensional and ten-group limits but restricts total area to 20 and at most 20 puzzles per file. Rotation-equivalent shapes appear in one group, and each instance is solvable.

## Building the approach

Represent occupied cells by a row-major bitmask. At every state, choose the first empty cell. In any completion, the tile covering it must have that cell as its top-left corner: extending above or left would cover an earlier row-major cell, which is already occupied. Therefore try only each available group's legal orientation anchored there.

Precompute masks for every valid placement. A nonsquare has two orientations; a square only one. A move requires remaining inventory and no overlap, then sets the placement bits and decrements that group's count. Identical copies share a count rather than labels, avoiding factorial overcounting.

Memoize by both occupancy and all remaining group counts. Counts are packed in mixed radix, using initial count plus one as each base, so subtracting one tile is one group multiplier. A full board counts only when inventory code is also zero.

## Walkthrough

A `3 x 2` board with two `1 x 1` tiles and two `1 x 2` dominoes has choices at the first cell for a unit tile, horizontal domino, or vertical domino; recursive completion yields eleven tilings. Forbidding rotation gives only three. A square's rotated dimensions are identical and must not create a second branch.

## Why it works

In every valid completion, the first empty cell belongs to exactly one tile whose top-left corner is that cell, so one of the precomputed anchored choices reproduces it. Removing that tile leaves the same kind of subproblem, proving completeness by induction. Every generated move remains in bounds, uses available inventory, and avoids overlap; accepting only full board plus zero inventory proves validity. Two branches differ in the group or rectangle covering their first divergence cell, while identical copies are unlabeled, so no tiling is counted twice. Occupancy and inventories fully determine future choices, making memoization sound.

## Complexity

For `S` reachable occupancy-and-inventory states and `G <= 10`, each state considers at most two orientations per group, taking `O(SG)` time and `O(S + WHG)` space. This is exponential state search justified by the local area-20 limit, not a polynomial algorithm for the original 100-by-100 dimensions.

## Common mistakes

- Disallowing rotations of nonsquare tiles.
- Trying both identical orientations of a square.
- Labeling identical copies and multiplying equivalent orders.
- Memoizing occupancy without remaining inventory.
- Applying exponential search to the original large dimensions without the local limit.
