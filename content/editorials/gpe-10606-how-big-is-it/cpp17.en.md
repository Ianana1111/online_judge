Sorting the radii supports duplicate pruning; it does not fix the final placement order. `gap[i][j]` stores the geometric horizontal separation for every pair.

`order` identifies the circles already placed and `x` stores their centers. A candidate starts at `radius[i]` and is shifted right enough to satisfy every existing circle. The recursive call receives the maximum of the old width and the candidate's right edge. After returning, both vectors and the used flag are restored for the next choice.

The initial `best` is the sum of all diameters, a feasible upper bound. A prefix with `width >= best` cannot improve it. The duplicate condition selects equal radii in a canonical order while still allowing all distinct geometric arrangements. Formatting rounds only the final minimum to three decimal places.
