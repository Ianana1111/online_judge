# Derive double, single, and uncovered areas from rectangle intersection

## Problem and constraints

A 100-by-100 land contains two positive-area axis-aligned guard rectangles. Report area guarded by both, by exactly one, and by neither. All coordinates are integers from 0 through 100, but the problem asks for geometric area rather than inclusive grid-point counts.

## Building the approach

Compute rectangle areas `A` and `B`. Their common x interval begins at the larger left edge and ends at the smaller right edge; clamp its width to zero when separated. Do the same for y. Their product `I` is the double-guarded area.

`A+B` counts singly covered area once and the intersection twice. Removing both copies of the intersection gives exactly-one coverage: `A+B-2I`. The two guarded categories are disjoint, so uncovered area is `10000-I-single`.

## Walkthrough

Rectangles `(10,10)-(20,20)` and `(15,15)-(25,25)` each have area 100 and overlap in a 5-by-5 square. Double coverage is 25, single coverage is `200-50=150`, and uncovered area is 9825. Rectangles touching only at an edge have zero intersection area.

## Why it works

The overlap of the x intervals times the overlap of the y intervals is exactly the rectangle intersection. Every land point has coverage count zero, one, or two. Summing the two rectangle areas assigns weight one to singly covered points and two to doubly covered points, so subtracting `2I` leaves only the single category. Subtracting both disjoint guarded categories from total land gives the remaining category.

## Complexity

Each case uses `O(1)` time and space.

## Common mistakes

- Subtracting the intersection only once and computing union rather than exactly-one area.
- Multiplying two negative overlap lengths into a false positive area.
- Adding one to continuous interval widths.
- Testing invalid zero-width input rectangles.
