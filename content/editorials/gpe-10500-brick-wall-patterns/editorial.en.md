# Classify the tile covering the first empty corner

## Problem and constraints

Count the ways to cover a wall of height two and width N with 1-by-2 bricks, without overlap or gaps. Bricks may be horizontal or vertical. Inputs satisfy 1 ≤ N ≤ 50, and zero terminates input. Reflected arrangements are not identified as the same arrangement.

## Building the approach

Instead of guessing complete layouts, inspect the brick covering the upper-left corner. There are only two orientations.

A vertical brick fills the whole first column, leaving the same problem with width N − 1. A horizontal brick covers the first two cells of the top row. The lower-left cell then forces another horizontal brick below it, leaving width N − 2. The rest of the wall is independent of those first bricks.

So `ways[N] = ways[N − 1] + ways[N − 2]`. Set `ways[1] = 1`. The less obvious base is `ways[0] = 1`: after filling the last columns, doing nothing more is one completed arrangement. Setting it to zero would erase valid tilings ending with a horizontal pair.

Precompute through 50 once. Recursively exploring layouts would repeatedly solve the same smaller widths, while the table evaluates each width only once.

## Walkthrough

Width two has two layouts: two vertical bricks or a pair of horizontal bricks. Width three has two layouts starting vertically and one starting with a horizontal pair, giving three. Width four then has 3 + 2 = 5 layouts.

## Why it works

Every tiling belongs to exactly one of the two first-brick orientations. Removing the forced first column or first two columns gives a one-to-one correspondence with tilings of the smaller wall. Conversely, adding those bricks to any smaller tiling gives a valid original tiling. The two disjoint counts therefore add without omissions or duplicates.

## Complexity

O(50) preprocessing time and space, then O(1) per query. The value at width 50 is 20,365,011,074, so the table needs 64-bit integers.

## Common mistakes

- Setting the empty-wall count to zero.
- Forgetting the second horizontal brick is forced.
- Counting reflected layouts as equivalent without such a rule.
- Using exponential recursion or a 32-bit table.
