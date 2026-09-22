# Run six-direction BFS through the three-dimensional dungeon

## Problem and constraints

The dungeon has `L` levels, `R` rows, and `C` columns, each at most 30. `S` is the start, `E` the exit, `#` rock, and other cells are open. Each minute moves one cell along exactly one of six face-sharing directions. Find the minimum escape time or print `Trapped!`. Three zeros end input; blank lines between floors are separators only.

## Building the approach

Treat every open cell as a graph vertex and every legal six-direction move as an edge of cost one. Initialize distances to -1, set the start to zero, and perform breadth-first search. For each dequeued cell, test all six neighbors; a neighbor within bounds, not rock, and still unvisited receives current distance plus one and is marked when enqueued.

The implementation flattens `(z,y,x)` into one integer id, but restores coordinates before generating neighbors and checks each axis independently. Directly adding one to a flat id could incorrectly wrap from the end of one row to the start of another. Formatted row input naturally skips floor-separator blank lines.

## Walkthrough

With two levels of one cell each, `S` below `E`, escape takes one minute, showing why vertical moves matter. In one level, `S#E` is blocked, but an open row beneath it can provide a four-step detour: down, right, right, up. Manhattan distance alone does not account for rock obstacles.

## Why it works

BFS processes cells in nondecreasing distance. When a cell at distance `d` first discovers a neighbor, it establishes a path of length `d+1`. Any shorter path would have reached that neighbor from an earlier BFS layer, contradicting its unvisited state. The six offsets cover exactly all legal actions, so the exit's recorded distance is minimal; if it remains unvisited, no legal path exists.

## Complexity

With `V = L*R*C`, every cell enters the queue at most once and checks six edges, giving `O(V)` time and `O(V)` space. The maximum is 27000 cells.

## Common mistakes

- Searching only four planar directions.
- Treating `E` as blocked because it is not `.`.
- Moving directly in flattened ids and wrapping across rows.
- Marking on dequeue and enqueuing the same cell repeatedly.
- Treating floor-separator blank lines as map rows.
