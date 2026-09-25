The current image is simply a two-dimensional character array; no shape objects are needed. Parse one command line at a time, ignoring an unknown line completely. Point, line, and rectangle commands recolor their specified ranges. Input gives column `x` before row `y`, both one-based.

For flood fill, read the starting pixel's old color and stop if it already equals the target. Otherwise run four-neighbor BFS, recoloring each old-color neighbor as soon as it is enqueued. The recoloring also marks it visited, so a large region is processed once.
