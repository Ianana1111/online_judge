Compute rectangle areas `A` and `B`. Their common x interval begins at the larger left edge and ends at the smaller right edge; clamp its width to zero when separated. Do the same for y. Their product `I` is the double-guarded area.

`A+B` counts singly covered area once and the intersection twice. Removing both copies of the intersection gives exactly-one coverage: `A+B-2I`. The two guarded categories are disjoint, so uncovered area is `10000-I-single`.

The full region has area ten thousand; subtract guarded land to obtain the unguarded area.
