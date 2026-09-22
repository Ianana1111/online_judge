# Classify infinite lines and compute their intersection with determinants

## Problem and constraints

Each case gives two distinct points for each of two infinite lines, with integer coordinates from -1000 to 1000. The lines may be disjoint and parallel, coincident, or meet at one point. Print `NONE`, `LINE`, or `POINT` followed by coordinates to two decimals, inside the required global header and footer. These are infinite lines, so an intersection need not lie between the supplied points.

## Building the approach

Slopes require a special case for vertical lines and introduce unnecessary division. Instead, write direction vectors `u = B - A` and `v = D - C`. Their two-dimensional cross product is zero exactly when the directions are parallel.

If `cross(u,v) == 0`, test `cross(C-A,u)`. A zero result means `C` lies on the first line and the two lines coincide; otherwise they are distinct parallel lines.

For nonparallel lines, write the intersection as `P = A + t*u`. Crossing `A + t*u = C + s*v` with `v` eliminates `s` and gives

`t = cross(C-A,v) / cross(u,v)`.

Both coordinates can therefore remain exact integer numerators over the same denominator. Round this rational value only when producing two decimal places. Integer determinants classify parallelism exactly, so no epsilon is needed.

## Walkthrough

For `(0,0)-(4,4)` and `(0,4)-(4,0)`, the formula gives `t = 1/2` and intersection `(2,2)`, printed as `POINT 2.00 2.00`. Two vertical lines with different x-coordinates have parallel directions but fail the collinearity test, so they produce `NONE`. Two point pairs on the same infinite line produce `LINE` even when the described segments do not overlap.

## Why it works

Two nonzero direction vectors have zero cross product exactly when they are linearly dependent, which proves the parallel classification. In that case, checking whether one point of the second line lies on the first distinguishes coincident from separate lines. Otherwise the determinant is nonzero, so the two linear equations have one unique solution. The derived value of `t`, substituted into `A + t*u`, satisfies both line equations exactly; final rational rounding changes only its printed representation.

## Complexity

Every case uses a constant number of arithmetic operations, taking `O(1)` time and extra space. Python integers keep all determinant and numerator calculations exact.

## Common mistakes

- Dividing slopes and failing on vertical lines.
- Reporting every parallel pair as `NONE` without testing coincidence.
- Restricting the parameters to `[0,1]` as if the inputs were segments.
- Reversing one cross-product order without also adjusting its sign.
- Truncating coordinates before formatting them to two decimals.
