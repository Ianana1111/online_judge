# Find the smallest enclosing circle, then compare squared radii

## Problem and constraints

A polygon has fewer than 100 distinct integer-coordinate vertices. Given a nonnegative decimal radius R, decide whether some circle of that radius can contain the whole polygon, including its boundary. The polygon need not be convex. Zero vertices terminates input.

## Building the approach

We do not need to check infinitely many points along the edges. A disk is convex: if it contains all vertices, it contains their connecting segments and the polygon inside their convex hull. The task reduces to enclosing a finite point set.

Checking only pairwise distances is insufficient. Three points can all be at most 2R apart yet still require a larger circumcircle. A minimum enclosing circle is determined by one point, two opposite boundary points, or three noncollinear boundary points.

Use incremental construction after shuffling the points. If a new point is already inside the current minimum circle, nothing changes. If it lies outside, the new minimum circle must have that point a on its boundary. Restart from the zero-radius circle at a and reconsider earlier points. An outside point b introduces a second boundary constraint; start from their diameter circle and reconsider earlier points again. An outside third point c determines a circumcircle. For collinear triples, use the farthest pair's diameter.

Integer coordinates make the center and squared radius rational. Exact fractions avoid an arbitrary epsilon near the threshold. Parse R from its original decimal string and compare squared radii, so no square root is needed.

## Walkthrough

The points `(0,0), (2,0), (0,2)` have minimum center `(1,1)` and squared radius two. Radius 1.5 works because 2.25 ≥ 2; radius 1.4 fails because 1.96 < 2. Collinear points `(0,0), (2,0), (4,0)` need only the extreme pair's diameter circle, and radius two fits exactly.

## Why it works

An already contained point cannot invalidate the current circle or permit a smaller one for the old points. An outside point must become a boundary constraint in the new minimum circle; otherwise the constrained optimum could be reduced while still containing it. Reconsidering earlier points with one, then two boundary constraints restores the enclosing-circle invariant. Three noncollinear boundary points determine a unique circle, while collinear points are enclosed by their extreme pair's diameter. The final circle is therefore minimal for all vertices. Exact squared comparison accepts equality and rejects a genuinely smaller supplied radius.

## Complexity

The randomized incremental method has expected O(N) geometric operations and O(N³) worst-case operations, using O(N) space. Rational arithmetic adds costs depending on coordinate digit lengths. The fixed shuffle makes runs reproducible; it does not turn the worst-case bound into a linear guarantee.

## Common mistakes

- Checking only pairwise distances.
- Using the vertex average as the center.
- Dividing by zero for a collinear triple.
- Rejecting points exactly on the boundary.
- Letting an overly large epsilon accept an insufficient radius.
