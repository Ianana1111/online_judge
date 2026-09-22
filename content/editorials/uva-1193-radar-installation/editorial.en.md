# Convert islands to intervals and place radars at earliest right endpoints

## Problem and constraints

Radars lie on the x-axis and cover islands within distance `D`. Given up to 1,000 islands on the sea side, find the minimum radars or report -1 when impossible. Tangency at `y=D` is valid, producing a single possible x-coordinate. All coordinates in a case must still be consumed after detecting impossibility.

## Building the approach

Radar position `p` covers island `(x,y)` exactly when `(p-x)^2+y^2<=D^2`. If `y>D`, no position works. Otherwise valid positions form the closed interval

`[x-sqrt(D^2-y^2), x+sqrt(D^2-y^2)]`.

The problem becomes minimum points hitting all intervals. Sort by right endpoint. For the first uncovered interval, place a radar at its right endpoint. Every later interval whose left endpoint is at most that position is covered; create another radar only when its left endpoint is strictly greater.

This implementation compares radical endpoints exactly with integer arithmetic rather than epsilon-sensitive floating point.

## Walkthrough

With `D=5`, islands `(0,3)` and `(8,3)` produce intervals `[-4,4]` and `[4,12]`; one radar at 4 covers both. An island at height 6 is impossible. An island at height exactly 5 has a zero-width but valid interval.

## Why it works

The distance inequality is equivalent to the derived interval. Consider the earliest-ending uncovered interval with right endpoint `r`. Every solution must place a radar inside it. Moving such a radar to `r` preserves coverage of all remaining intervals it previously hit: their right endpoints are at least `r`, and their left endpoints were no greater than the old radar. Thus the greedy choice never increases the number needed. Repeating this exchange proves optimality. Closed endpoints justify reusing a radar on equality.

## Complexity

Sorting takes `O(N log N)` exact endpoint comparisons and scanning `O(N)`, with `O(N)` storage.

## Common mistakes

- Placing each radar only at an island's x-coordinate.
- Rejecting the tangent case `y=D`.
- Sorting by center without maintaining interval feasibility.
- Adding a radar when intervals merely touch.
- Stopping input parsing after the first impossible island.
