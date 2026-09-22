# Run BFS on the 64 chessboard squares

## Problem and constraints

Given two squares on a standard 8-by-8 board, find the minimum knight moves between them. Files `a` through `h` and ranks `1` through `8` identify squares. A knight moves two cells along one axis and one along the other, with eight signed possibilities, and may not leave the board. Equal endpoints require zero moves.

## Building the approach

Treat each square as a graph vertex and every legal knight move as an unweighted edge. Initialize every distance to -1, give the source distance zero, and run breadth-first search.

For each dequeued square, try all eight paired coordinate offsets. Ignore out-of-range or already visited destinations. A new square receives the current distance plus one and is marked before entering the queue, preventing duplicate work.

An infinite-board distance formula is unsafe because board boundaries block routes near corners. With only 64 vertices, a direct BFS per query is simple and complete.

## Walkthrough

`b1` to `c3` is one legal knight move. `a1` to `b2` requires four moves because the corner restricts available paths, while `b2` to `c3`, despite the same coordinate difference, takes two. A query from `f6` to `f6` returns the initialized zero without moving.

## Why it works

BFS processes squares in nondecreasing path length. When it first discovers a neighbor from distance `d`, it has found a path of length `d+1`. A shorter path would have reached that square from an earlier BFS layer, contradicting its unvisited state. The eight offsets cover every knight action and the bounds test removes exactly illegal ones, so the target's stored distance is the legal minimum.

## Complexity

Each query processes at most 64 vertices and eight candidate edges per vertex, using `O(64*8)` time and `O(64)` space, both constant for this board.

## Common mistakes

- Listing only four of the eight signed moves.
- Modeling a king or bishop instead of a knight.
- Applying an infinite-board formula near boundaries.
- Initializing the source distance to one.
- Indexing the distance array before checking bounds.
