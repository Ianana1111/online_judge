# Weight the polygon's area, not its vertices

## Problem and constraints

Find the centroid of a uniform convex polygon with 3 to 100 distinct integer-coordinate vertices. The input vertices are unordered, and no three are collinear. Print both coordinates to three decimal places. A count below three ends input before any coordinates for that count are consumed.

## Building the approach

The average of the vertices is tempting, but it gives equal mass to the corners rather than to the polygon's area. A wide part of the polygon should contribute more mass. We need an area-weighted calculation after restoring the boundary order.

The vertex average still helps: it lies inside a convex polygon, so sorting vertices by angle around it recovers their cyclic boundary order. Avoid floating-point angles by scaling each relative vector by N: use `(Nx − sum_x, Ny − sum_y)`. Split vectors into two half-planes, then compare vectors within one half-plane by their cross product.

For consecutive boundary vertices, let `cᵢ = xᵢyᵢ₊₁ − xᵢ₊₁yᵢ`, including the last-to-first edge. If `S = Σcᵢ`, the centroid coordinates are `Σ(xᵢ+xᵢ₊₁)cᵢ / (3S)` and `Σ(yᵢ+yᵢ₊₁)cᵢ / (3S)`. Keep these as exact integer numerators and denominators until formatting.

## Walkthrough

A unit square gives `(0.500, 0.500)` regardless of its input vertex order. For the trapezoid `(0,0), (4,0), (2,2), (0,2)`, the vertex average is `(1.5, 1)`, but the wider lower part pulls the area centroid downward. The true answer is `(14/9, 8/9)`, printed as `1.556 0.889`.

## Why it works

An interior point sees the vertices of a convex polygon in boundary order, so the angular sort supplies valid consecutive edges. Each edge and the origin form a signed triangle with double area cᵢ and centroid `(Pᵢ + Pᵢ₊₁)/3`. Summing signed areas and first moments cancels any overlap or exterior parts. Dividing total moment by total area gives the polygon centroid. Reversing orientation negates both numerator and denominator and leaves the result unchanged.

## Complexity

O(N log N) comparisons for sorting and O(N) arithmetic steps for the moments, using O(N) space. Actual integer arithmetic costs depend on coordinate digit lengths.

## Common mistakes

- Returning the vertex average as the answer.
- Applying the formula directly to unordered vertices.
- Sorting only by x-coordinate.
- Forgetting the closing edge or the factor three in the denominator.
- Truncating integer division before formatting the final fraction.
