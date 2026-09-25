For each type, choose each of its three dimensions as height. Sort the remaining two dimensions into `x <= y` to give one canonical base orientation, producing at most `3N` states.

Think of a directed edge from a larger base to a strictly smaller base. Both dimensions decrease along every edge, so cycles are impossible. Sort states by `(x,y)` ascending and let `best[i]` be the tallest tower whose bottom block is orientation `i`.

Start `best[i]` at its own height. Every earlier orientation `j` with `x[j] < x[i]` and `y[j] < y[i]` can be the bottom of the tower placed above `i`, so update with `height[i] + best[j]`. The maximum over all possible bottoms is the answer.

Generate the three height orientations of each block and sort each base’s sides. Process bases from small to large, computing the tallest tower with each orientation at the bottom by extending only orientations whose two base sides are strictly smaller.
