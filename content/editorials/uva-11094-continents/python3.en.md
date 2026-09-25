The task is naturally split into two uses of the same flood fill. First, start from the king and mark every cell in the king's connected component; ignore the returned size. Then scan the map. Whenever an unvisited cell has the land character, flood from it, count that whole component, and compare its size with the answer.

Rows and columns require different boundary rules. A row outside `[0, M)` is invalid. A neighboring column is normalized with `(column + delta + N) % N`, which joins the horizontal edges and also avoids a negative C++ remainder when moving left from column zero.

The first BFS marks the king’s entire continent. Later BFS runs measure other regions of the same character. Only columns wrap; rows still have boundaries.
