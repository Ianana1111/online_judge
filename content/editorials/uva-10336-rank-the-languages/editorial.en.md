# Count four-connected components for each language

## Problem and constraints

Every grid cell contains a lowercase language letter. Edge-connected cells with the same letter form one country. Count the countries for every language that appears, then rank languages by decreasing country count and, on a tie, increasing letter. Diagonal contact does not connect countries, and the required output begins with `World #k`.

## Building the approach

The answer counts connected regions, not cells. Scan the grid. Whenever an unvisited letter is found, this is the first cell of one previously uncounted country. Save its letter, run a four-direction flood fill through all matching cells, mark them visited, and increment that language's component count once.

An explicit stack avoids recursion-depth trouble for a long winding country. Because valid input contains only lowercase letters, replacing a cell with `.` safely marks it visited. Mark a neighbor when it is pushed, not when it is later popped, so multiple paths cannot insert the same cell repeatedly.

Finally, collect only letters with positive counts and sort by the two requested keys.

## Walkthrough

In the grid

`ab`

`ba`

the two `a` cells touch only diagonally, so they form two countries. The same is true for `b`; both counts are two, and `a` appears first because letter order breaks the tie.

A 2-by-3 grid filled entirely with `a` has six cells but only one country. Counting area or using diagonal movement would answer a different question.

## Why it works

A flood fill moves only across edges to cells with the saved letter, so every visited cell belongs to the starting country's connected component. Conversely, every cell of that country has a same-letter edge path from the start, and the traversal follows that path until the cell is reached. Thus one traversal marks exactly one country.

Marked cells never start another traversal. Every country contains some cell encountered by the outer scan, so each is counted exactly once. Sorting the resulting positive counts by descending count and ascending letter then produces precisely the required ranking.

## Complexity

Each of the `H*W` cells enters a stack at most once and inspects four neighbors, so traversal takes `O(HW)` time. Sorting at most 26 languages costs `O(26 log 26)`. The grid and stack use `O(HW)` space.

## Common mistakes

- Treating diagonal cells as connected.
- Counting the number of letter cells instead of separate components.
- Incrementing once per visited cell rather than once per completed flood fill.
- Marking only when popping and pushing the same cell many times.
- Reversing the alphabetical tie breaker.
- Carrying component counts from one world into the next.
