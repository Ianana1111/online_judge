# Count eight-direction oil connected components

## Problem and constraints

In a grid, `@` is oil and `*` is empty. Oil cells belong to the same deposit when connected horizontally, vertically, or diagonally. Rows and columns are at most 100, a zero row count ends input, and each deposit contains at most 100 cells. Count connected deposits rather than oil cells. The eight-direction rule is essential.

## Building the approach

Scan every grid cell. Finding an unvisited `@` proves that a previously uncounted component has been reached, so increment the answer and launch a stack-based traversal. Visit every oil neighbor in all eight directions and change it to `*` as soon as it is pushed.

Marking at discovery time prevents the same cell from being pushed by several neighbors. Generate neighbors with row and column offsets from -1 through 1, excluding `(0,0)`. Bounds must be checked before indexing.

After the traversal removes the entire component, the outer scan cannot count any of its other cells again.

## Walkthrough

Two rows `@*` and `*@` contain diagonally touching cells, so they form one deposit. A four-direction traversal would incorrectly report two. An all-empty grid returns zero, while one `@` returns one.

Two clusters count separately only when no chain of horizontal, vertical, or diagonal oil cells connects them.

## Why it works

The traversal moves only across legal eight-neighbor oil edges, so every marked cell belongs to the start's deposit. Conversely, every cell in that deposit has such a path from the start; following the path shows that the traversal eventually discovers it.

Thus one traversal marks exactly one complete deposit. The outer scan starts a traversal only at an unmarked oil cell, so every component increments the answer once and only once.

## Complexity

Each of `R*C` cells is processed at most once and checks eight neighbors, giving `O(RC)` time. The grid uses `O(RC)` storage, and the traversal stack is bounded by the current component.

## Common mistakes

- Exploring only four directions.
- Counting all `@` cells instead of components.
- Mixing row and column bounds.
- Marking only when popping and pushing duplicates repeatedly.
- Reusing a modified grid across test cases.
