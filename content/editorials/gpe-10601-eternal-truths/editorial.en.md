# The next required step length is part of your position

## Problem and constraints

Find the fewest moves from S to E in a maze with 2 to 300 rows and columns. Move in one of four directions, with mandatory lengths cycling through 1, 2, 3, then 1 again. A move stays straight and cannot cross a wall or leave the board. Reaching E counts only at the end of a complete move. Print `NO` if unreachable.

## Building the approach

Ordinary grid BFS marks a cell visited once. Here that loses information: arriving at the same cell when the next move must have length one can offer different choices from arriving when it must have length three. The real state is `(row, column, phase)`.

Use phases zero, one, and two for next lengths one, two, and three. Start at S with phase zero. For every direction, walk through the required number of cells, checking each intermediate cell and the endpoint. If the whole segment is legal, enqueue its endpoint with phase `(phase + 1) % 3`.

Each transition is one move even when it covers three cells. All edges in this state graph therefore have equal cost, so BFS minimizes move count directly. Stop when an exit state is removed from the queue, regardless of its phase.

## Walkthrough

Consider a corridor containing S, an empty cell, a wall, and E in that order. The first move can reach the empty cell. The next required length is two, but landing on E would cross the wall, so that move is illegal. Similarly, passing over E during a longer move does not finish the journey: E must be the landing cell.

## Why it works

Position and phase determine all legal future moves. Checking every cell along a fixed direction accepts exactly the permitted straight segments, and the phase update preserves the required rhythm. Thus paths in the state graph correspond to legal journeys, with one edge per move. BFS visits states in nondecreasing move count, so its first dequeued exit state is optimal. If none is reachable, no valid journey exists.

## Complexity

There are at most 3RC states. Each checks four directions and at most three cells per direction, giving O(RC) time and space.

## Common mistakes

- Marking only the cell, without the phase.
- Checking only a long move's destination and jumping through walls.
- Updating the phase for every traversed cell.
- Stopping when passing over E.
- Counting traversed cells instead of moves.
