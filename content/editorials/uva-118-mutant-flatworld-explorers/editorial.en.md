# Simulate each robot with one persistent scent map

## Problem and constraints

Robots move on inclusive integer coordinates from `(0,0)` to a given upper-right corner. Commands are `L`, `R`, and `F`. A robot stepping outside is lost at its last valid cell and leaves a scent there. Later robots attempting any outward move from a scented coordinate ignore that `F` and continue. Scent belongs to coordinates, not directions, and persists across robots.

## Building the approach

Encode north, east, south, west as indices 0 through 3 in clockwise order. Turn right by adding 1 modulo 4 and left by adding 3 modulo 4. Direction-indexed delta arrays implement forward movement.

For `F`, compute a candidate coordinate before changing state. If it is inside, commit the move. If outside and the current coordinate is scented, ignore only this command. If outside without scent, mark the current coordinate, declare the robot lost, and stop its remaining instructions.

Allocate the scent grid once outside the robot loop. A scent does not block ordinary entry or valid departure from that cell.

## Walkthrough

On a world ending at `(1,1)`, a robot at `(1,1)` facing north attempts `(1,2)`, is lost at `(1,1)`, and scents it. A later robot at the same coordinate facing east also ignores its outward `F`, even though the edge direction differs. It may then turn and move legally to `(0,1)`.

## Why it works

The direction index and delta table implement every turn and forward command exactly. Forward movement has three exhaustive outcomes: legal move, scented dangerous move ignored, or new dangerous move causing loss and scent. The persistent grid matches the shared-world rule, while loss stops at the last valid coordinate. Induction over commands and robots proves all state and output fields match the specification.

## Complexity

For total instruction length `L`, simulation takes `O(L)` time. The scent grid uses at most `51*51` Boolean cells.

## Common mistakes

- Treating the maximum coordinates as exclusive.
- Updating to the outside coordinate before checking bounds.
- Clearing scents between robots or storing them by direction.
- Stopping a robot after an outward move was safely ignored.
