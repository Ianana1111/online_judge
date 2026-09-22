# Reserve front positions and query occupied prefixes with a Fenwick tree

## Problem and constraints

Movies initially appear top-to-bottom as 1 through `n`. Before each of up to 100,000 requests, print how many boxes are above the requested movie, then move it to the top. Repeated requests must reflect all prior moves.

## Building the approach

Use smaller position numbers for higher boxes. Reserve positions 1 through `m` for future move-to-front operations and place initial movie i at `m+i`. A Fenwick tree stores whether each position is occupied, and `position[i]` locates each movie.

The number above a requested movie is the occupied prefix ending at `position-1`. Then subtract its old occupancy, assign the next decreasing reserved `top`, and add occupancy there. No other movie position changes.

## Walkthrough

For three movies requested 3,1,1, movie 3 initially has two above it and moves to top; movie 1 then has one above; requesting 1 again has zero. Output is `2 1 0`. Failing to clear old positions creates ghost duplicates and corrupts later ranks.

## Why it works

Maintain that every movie occupies exactly its recorded position and increasing positions equal current top-to-bottom order. Fenwick prefix before a movie counts exactly the boxes above it. Removing its old cell and placing it at a smaller-than-all-current reserved position performs move-to-front while preserving every other relative order. The invariant holds initially and after every request.

## Complexity

Initialization and requests take `O((n+m) log(n+m))` time and `O(n+m)` space.

## Common mistakes

- Including the movie itself in the prefix.
- Leaving the old position occupied.
- Reversing the initial stack order.
- Updating Fenwick index zero.
- Moving before reporting and always printing zero.
