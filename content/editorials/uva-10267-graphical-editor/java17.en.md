Represent the current picture as a two-dimensional `char` array and parse one command line at a time. `I` rebuilds it, `C` clears it while keeping dimensions, and `L`, `V`, `H`, and `K` recolor specified cells. The input gives one-based `x` before `y`, corresponding to `image[y-1][x-1]`.

Only `F` needs a search. If source and target colors differ, run four-neighbor BFS from the starting pixel, extending only through the old color and recoloring on enqueue. An integer-array queue with one slot per pixel handles even a full-picture region without recursive stack growth.
