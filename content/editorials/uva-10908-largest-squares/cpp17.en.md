`limit` takes the minimum distance to top, left, bottom, and right boundaries. Expansion starts at one because radius zero needs no test.

For every offset, four comparisons cover the complete top, bottom, left, and right borders. Corners may be checked twice, which is harmless. `radius` changes only after a full successful border, so the failing layer is excluded.

The header is printed immediately after reading the grid dimensions and query count. Every query resets radius and outputs `2*radius+1`, including one-cell grids.
