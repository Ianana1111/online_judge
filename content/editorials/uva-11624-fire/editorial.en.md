# Compute fire arrival times before searching for a safe escape

## Problem and constraints

Joe and every fire spread one cell per minute in four directions through nonwall cells. The grid has exactly one `J`, any number of `F`, and up to one million cells. Joe must reach each cell strictly before fire. Reaching a boundary cell still requires one additional minute to step outside, so starting on the boundary has answer 1.

## Building the approach

First run a multi-source BFS with every fire cell at time zero. This produces the earliest fire time for every cell; unreachable cells retain infinity. Then run a second BFS from Joe. A move arriving at time `t` is allowed only if `t < fire[next]`; equality is unsafe.

When Joe's BFS removes a boundary cell, return its distance plus one for the step outside. There is no need for that old cell to remain safe during the next minute because Joe has left it. Checking the boundary before enumerating neighbors also makes all later neighbor coordinates valid.

## Walkthrough

A one-cell grid containing J returns 1. In `### / #J. / #.F`, both possible next cells burn at minute one, exactly when Joe would arrive, so escape is impossible. A J already on the boundary can step out in one minute even if fire is adjacent.

## Why it works

Multi-source BFS gives the minimum path distance from any fire source, exactly the earliest burning time. Joe's BFS retains only paths whose arrival at every cell precedes that time, so every searched path is safe. Every valid escape path satisfies the same inequalities and is therefore not excluded. BFS processes safe paths in nondecreasing length, so the first boundary cell removed yields the earliest possible exit after adding its final step.

## Complexity

Both BFS passes take `O(RC)` time and together use `O(RC)` space for times, distances, and queues.

## Common mistakes

- Expanding only one of several fire sources.
- Allowing Joe to arrive simultaneously with fire.
- Forgetting the step from a boundary cell outside the grid.
- Initializing fire-unreachable cells to zero instead of infinity.
- Applying an incorrect sequential fire-before-Joe interpretation.
