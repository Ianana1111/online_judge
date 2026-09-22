For each height index `h`, the two cyclically selected remaining dimensions form the base and are sorted before entering `blocks`. Duplicate orientations are harmless because the strict comparison prevents equal bases from stacking on one another.

Sorting puts every strictly smaller base before a possible larger bottom. `best[j]` already includes the entire tower rooted at `j`, so an update adds only the current block's height. Both `x` and `y` are compared separately rather than using area. Case numbering and the required spaces around the output's equals sign are emitted directly.
