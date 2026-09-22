# Simulate the pixels directly and use BFS for flood fill

## Problem and constraints

Simulate an image editor whose bitmap is at most 100 by 100 pixels. `I` creates a white (`O`) image, `C` clears the current image, `L` colors one pixel, `V` and `H` draw inclusive lines, `K` draws a filled rectangle, `F` recolors the four-connected region containing a pixel, `S` prints a name and the image, and `X` exits. Coordinates are one-based and given as column `x` before row `y`. An unknown command causes its whole line to be ignored.

## Building the approach

Represent the image as a vector of row strings and apply commands in their input order. A point, line, or rectangle is just an inclusive loop over the affected cells. Vertical and horizontal endpoints may arrive in reverse order, so normalize them before looping.

Flood fill is the only operation that needs a graph traversal. Record the starting color `old`. If it already equals the target color, nothing needs to happen. Otherwise, start a breadth-first search at the selected pixel. From every reached cell, inspect only its four edge-sharing neighbors. A neighbor enters the queue exactly when its current color is `old`; recolor it immediately on insertion so the new color also serves as a visited mark.

Parse each physical command line with its own `istringstream`. If the operation character is unknown, leaving the dispatch chain automatically discards all remaining parameters on that line.

## Walkthrough

Imagine a 3-by-3 image where the top-left and center pixels are `A` and all others are `O`. Filling from the top-left with `B` changes only that pixel: the center touches it diagonally, and diagonal contact is not connected.

If a region is filled with its current color, the image must remain unchanged. The early return is also necessary because an unchanged color cannot mark visited pixels. After `C`, the dimensions remain 3 by 3 and the next `S` prints three rows of three `O` characters.

## Why it works

Each basic drawing loop enumerates exactly the inclusive coordinates named by its command, so it changes all and only the required pixels.

For a fill, every cell inserted into the queue is either the start or an old-colored edge neighbor of an already reached cell. Therefore every recolored cell belongs to the start's old-color four-connected component. Conversely, any cell in that component has a path of old-colored edge neighbors from the start; BFS follows that path one step at a time and eventually reaches it. Immediate recoloring prevents duplicates, and the equal-color special case keeps that marking rule valid. Since all commands are correctly applied in order, every `S` observes the exact editor state.

## Complexity

`I`, `C`, a worst-case `F`, and `S` take `O(MN)` time. `L` is `O(1)`; lines and rectangles take time proportional to the pixels they cover. The bitmap and flood-fill queue use `O(MN)` space.

## Common mistakes

- Swapping row and column because the input gives `x` before `y`.
- Omitting the last endpoint of a line or failing to normalize reversed endpoints.
- Using eight-neighbor flood fill and joining diagonal regions.
- Filling with the same color without a special case, causing repeated traversal.
- Parsing as a token stream so parameters after an unknown command become a new command.
- Clearing the dimensions along with the pixels in command `C`.
