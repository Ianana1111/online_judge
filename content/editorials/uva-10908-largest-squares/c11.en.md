Radius zero, a 1-by-1 square, is always valid. A radius-k square spans rows `r-k..r+k` and columns `c-k..c+k`, with side `2k+1`.

When radius k-1 is already valid, expanding adds only the top, bottom, left, and right border lines. Check every character on these four sides against the center. If all match, accept the new radius; on the first mismatch, stop because every larger square includes that cell.

The maximum possible radius is the minimum distance from the center to the four grid boundaries. Computing it first keeps every border index valid.

Expand one ring at a time around the queried cell; inspect only the newly added border and stop at the first mismatch.
