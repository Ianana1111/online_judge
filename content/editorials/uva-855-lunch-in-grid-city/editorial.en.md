# Minimize Manhattan distance with lower medians on both axes

## Problem and constraints

Friends live at intersections in a grid city. Choose an intersection minimizing their total walking distance, where adjacent streets or avenues are one unit apart. If several points are optimal, select the smaller street and smaller avenue. There may be up to 50000 friends, duplicate residences count separately, and the answer need not be an original residence.

## Building the approach

Distance from `(si,ai)` to `(s,a)` is `|s-si| + |a-ai|`. Summing separates into one function of `s` and one of `a`, so optimize axes independently. Sort all street coordinates and all avenue coordinates, then choose a median on each.

For odd friend count, the central value is unique. For even count, every integer between the two central values minimizes absolute deviation; the tie rule chooses the lower median. Zero-based index `(F-1)/2` selects the lower median in both parity cases.

The mean minimizes squared distances, not these absolute distances, and deduplicating residences would discard people's weights.

## Walkthrough

Friends at `(1,1)` and `(2,2)` make every corner of their rectangle optimal, so lower-axis ties select `(1,1)`. Friends at `(1,1000)` and `(1000,1)` also select `(1,1)`, even though nobody lives there. A few distant friends do not drag the median like they would an average.

## Why it works

In one sorted dimension, pair outermost coordinates. For any meeting coordinate `p`, each pair contributes at least their difference, with equality while `p` lies between them. Intersecting these optimal intervals leaves the middle coordinate or interval between the two middle coordinates, exactly the median set. Choosing its left endpoint gives the smallest optimum. Since street and avenue costs add independently, combining their lower medians minimizes total Manhattan distance and satisfies both tie rules.

## Complexity

Sorting both arrays takes `O(F log F)` time and `O(F)` storage. No full city grid is needed.

## Common mistakes

- Using the mean instead of a median.
- Taking the upper median for an even number of friends.
- Restricting the answer to an existing residence.
- Sorting coordinate pairs and selecting one friend instead of separating axes.
- Removing duplicate residences.
