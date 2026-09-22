# Enumerate only rational portion sizes where visit counts change

## Problem and constraints

Student `i` eats `y_i` units. Every serving has one common size `S`; food may be wasted, but each student may fetch at most three times. Cost is `a` times total waste plus `b` times the total number of fetches. Find the minimum exact cost as a reduced fraction. Up to 1,000 appetites lie from 1 through 100, and `S` may be fractional.

## Building the approach

Student `i` needs `ceil(y_i/S)` visits, so feasibility requires `S>=max(y)/3`. A visit count changes only at `S=y_i/k` for `k=1,2,3`. Between consecutive breakpoints all visit counts are fixed, while cost increases with `S`, so an optimum occurs at a breakpoint. Enumerate each occurring appetite `p` and denominator `q` from 1 through 3.

Build appetite frequencies and prefix counts. For `S=p/q`, students with `y<=S` visit once, those with `S<y<=2S` twice, and the rest three times. Therefore total visits are

`Y = 3n - count(y<=S) - count(y<=2S)`.

Multiplying cost by `q` gives numerator `(a*p+b*q)Y - a*sum(y)*q`. Compare candidates by cross multiplication, avoiding floating point, and reduce the final fraction.

## Walkthrough

For appetites `3,7,1,9,12` with `a=b=1`, `S=4.5` produces visit counts 1,2,1,2,3, totaling 9. Supplied food is 40.5 versus 32 eaten, so cost is `8.5+9=17.5=35/2`. A seemingly cheaper `S=3` is invalid because appetite 12 would require four visits.

## Why it works

For a fixed visit vector, cost is `a*S*Y-a*sum(y)+b*Y`, strictly increasing in `S` because `a,Y>0`. Thus any optimum inside an interval can move left to its breakpoint without increasing cost. The breakpoints and feasible left boundary are exactly among enumerated `y_i/k`. Prefix counts compute each candidate's exact one-, two-, and three-visit population, and the derived fraction equals its true cost. Exhaustive exact comparison therefore finds the global minimum.

## Complexity

Frequency construction is `O(n)`. At most 300 candidates take `O(1)` each, using `O(100)` space.

## Common mistakes

- Trying only integer portion sizes.
- Ignoring the maximum of three visits.
- Rounding instead of using ceiling visit counts.
- Multiplying one portion by student count instead of total visits.
- Using approximate floating output instead of a reduced fraction.
