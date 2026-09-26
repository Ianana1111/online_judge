To reach an intersection, the last step comes either from the left or from below. These possibilities are disjoint, so add their counts. A wolf intersection has zero ways. Initialize the origin to one: the single empty path before taking any step.

One DP row is enough. During a bottom-to-top, left-to-right scan, ways[x] still holds the count from below, while ways[x−1] already holds the count from the current row's left neighbor. Add in place. At a wolf, reset the value to zero so an old count cannot pass through the blocked intersection.

The final answer fits an unsigned 32-bit integer, but intermediate counts on dead ends may be much larger. An unobstructed 100×100 grid has C(200,100)<10^60 paths. C/C++ use eight nine-digit limbs to keep every intermediate exact; Java uses BigInteger. Only addition is needed: propagate carries from low limbs to high limbs.

Print separate sentences for zero, one, and multiple paths, including the correct singular/plural wording. There are (w+1)(h+1) updates; DP stores w+1 numbers, plus a grid of blocked intersections.
