# Convert each sprinkler to an interval and greedily cover the strip

## Problem and constraints

Up to 10000 sprinklers lie on the center line of a grass strip with length `L` and width `W`. Each sprinkler has a position and circular radius. Find the minimum number whose water covers the entire strip, or print `-1` if impossible. The empty target with length zero needs no sprinkler. Coverage must include the full width, and touching interval endpoints count as continuous coverage.

## Building the approach

Reduce the two-dimensional geometry to one-dimensional intervals. At horizontal displacement `d` from a sprinkler, the top and bottom boundaries are `W/2` away vertically. The entire cross-section is covered exactly when

`d^2 + (W/2)^2 <= r^2`.

Thus an effective sprinkler covers the horizontal interval

`[x-sqrt(r^2-W^2/4), x+sqrt(r^2-W^2/4)]`.

A radius no greater than `W/2` contributes no positive-length interval. Scaling horizontal coordinates by two gives endpoints `2x ± sqrt(4r^2-W^2)`.

Now sort intervals by their left endpoint. Let `covered` be the end of the already covered prefix. Among every interval starting at or before `covered`, choose the one reaching farthest right. If none advances the endpoint, a gap is unavoidable. Otherwise count it and repeat until reaching `2L`. The implementation compares signed radical endpoints exactly with integer algebra, preventing floating error from turning a true touch into a gap or hiding a small real gap.

## Walkthrough

For width six and radius five, the usable horizontal half-length is four. Sprinklers centered at four and twelve cover `[0,8]` and `[8,16]`. Their endpoints touch, so two sprinklers cover a length-16 strip. Using the full radius as horizontal reach would incorrectly give each a length-ten half-span and could underestimate the answer.

## Why it works

If a circle contains both boundary points of a vertical cross-section, convexity of the circle implies it contains the segment between them. If a boundary point is uncovered, the strip is not fully covered. Therefore the derived intervals describe exactly where one sprinkler covers the full width.

At the current prefix endpoint, the next interval in any complete cover must start no later than `covered`. Replacing that interval by the eligible interval with the farthest right endpoint never reduces coverage and never increases the number chosen. Hence an optimal solution exists with the greedy choice. Repeating this exchange proves all greedy choices optimal. If no eligible interval advances, every possible continuation leaves the same gap, so coverage is impossible.

## Complexity

Sorting takes `O(N log N)` comparisons and the greedy scan visits every interval once, using `O(N)` space. Exact comparisons use a fixed number of arbitrary-precision integer operations.

## Common mistakes

- Ignoring strip width and using the circle's full horizontal diameter.
- Choosing the earliest-ending interval as in activity selection.
- Treating exactly touching endpoints as a gap.
- Looking only at interval lengths and ignoring positions.
- Adding an arbitrary epsilon that can erase a real gap.
