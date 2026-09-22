`r0` and `r1` hold successive remainders; `(x0,y0)` and `(x1,y1)` hold their matching coefficient pairs. Temporary variables compute all three updates before any old value is replaced.

After Euclid ends, `stepX = b / r0` and `stepY = a / r0` define the general-solution shift. The zero crossings occur at `-x0 / stepX` and `y0 / stepY`. `floorDiv` subtracts one from C++'s quotient when the remainder is negative; both denominators are positive. Each floor and the next integer are tested, along with the original solution.

The tuple key `(abs(x)+abs(y), x>y, x, y)` first minimizes the required cost, then favors the requested inequality because `false` sorts before `true`. The final coordinates only make any remaining tie deterministic. Output uses the original A/B coefficient order.
