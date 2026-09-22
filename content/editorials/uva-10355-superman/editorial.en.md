# Intersect the flight segment with each sphere in parameter space

## Problem and constraints

Superman flies along a straight segment between two distinct three-dimensional points. Each polluted region is a sphere; their interiors do not overlap, although they may touch. For every city, print the percentage of the flight segment lying inside polluted spheres, rounded to two decimal places. Coordinates have absolute value below 21, radii are positive integers below 21, and there are at most ten spheres.

## Building the approach

Parameterize the flight as `P(t)=A+tV`, where `V=B-A` and `0<=t<=1`. For a sphere with center `C` and radius `r`, points inside it satisfy

`|P(t)-C|^2 <= r^2`.

Expanding gives `a*t^2+2*b*t+c <= 0`, with `a=V dot V`, `b=(A-C) dot V`, and `c=|A-C|^2-r^2`. Its discriminant in this form is `D=b^2-a*c`. A negative value misses the sphere, while zero is a tangent and contributes no length. For positive `D`, the infinite line lies inside the sphere between roots `(-b-sqrt(D))/a` and `(-b+sqrt(D))/a`.

Those roots belong to the infinite line, so intersect their interval with `[0,1]`. This clipping handles spheres beyond an endpoint and flights that begin inside a sphere. Since movement along `P(t)` has constant speed, the clipped interval length is exactly the fraction of the complete flight spent inside that sphere. Sum these fractions; disjoint interiors guarantee no double counting.

## Walkthrough

From `(0,0,0)` to `(4,0,0)`, a sphere centered at `(2,0,0)` with radius one is entered at `t=1/4` and left at `t=3/4`. The interval length is one half, so the output is `50.00`.

If a radius-five sphere is centered at the start and the endpoint is `(10,0,0)`, the infinite line has a chord of length ten, but only the half from `t=0` to `t=1/2` belongs to the flight. Clipping again gives 50 percent.

## Why it works

The quadratic inequality is exactly the squared-distance definition of points inside a sphere. For positive `a` and discriminant, its solution lies between the two roots; intersecting that solution with `[0,1]` leaves exactly the portion of the actual flight segment inside the sphere.

For any parameter interval of length `d`, the corresponding physical length is `d*|V|`, while the whole flight has length `|V|`. Their ratio is `d`. The polluted interiors do not overlap, so summing all clipped ratios counts every polluted part once. Multiplying by 100 therefore gives the requested percentage.

## Complexity

Each of `R<=10` spheres requires a constant number of dot products and one square root. Time is `O(R)` and extra space is `O(1)`. The discriminant is computed exactly in `long long` before roots use `long double`.

## Common mistakes

- Using the full chord of the infinite line without clipping to the flight segment.
- Counting negative parameter values when the flight begins inside a sphere.
- Keeping only the largest polluted interval instead of summing all regions.
- Giving a tangent point positive length.
- Dividing by the flight length again after already computing a parameter ratio.
