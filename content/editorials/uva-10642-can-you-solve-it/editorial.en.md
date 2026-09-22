# Assign a triangular-number index to every coordinate

## Problem and constraints

The directed path visits all nonnegative coordinate points diagonal by diagonal: first `x+y=0`, then `x+y=1`, and so on. Within one diagonal it starts at `x=0` and increases `x`. Given a start and a reachable destination, count traversed edges. Coordinates are at most 100000; equal endpoints require zero steps.

## Building the approach

Assign each point its zero-based position along the complete path. For `(x,y)`, let `d=x+y`. Diagonals before it contain

`1+2+...+d = d(d+1)/2`

points. Within diagonal `d`, `(0,d)` is first and each path step increases `x`, so the offset is exactly `x`. Therefore

`position(x,y)=d(d+1)/2+x`.

Every directed edge advances the position by one, so destination position minus start position is the answer. The problem guarantees reachability; taking an absolute value would silently define behavior for invalid reverse input.

## Walkthrough

Positions begin `(0,0)=0`, `(0,1)=1`, `(1,0)=2`, and `(0,2)=3`. On diagonal three, `(0,3)` has position six and `(3,0)` has position nine, so moving between them takes three edges.

Identical endpoints have equal positions and correctly give zero rather than one.

## Why it works

Diagonal `d` contains exactly `d+1` nonnegative points. Summing sizes of all earlier diagonals gives the triangular-number prefix. The path visits the current diagonal in increasing `x`, so adding `x` selects precisely the coordinate's offset and gives its unique global index.

Consecutive path vertices have consecutive indices. Therefore the number of edges from a reachable start to destination is exactly the difference of their indices.

## Complexity

Each case uses `O(1)` time and space. The triangular product requires 64-bit arithmetic because it exceeds 32-bit range.

## Common mistakes

- Using `y` as the within-diagonal offset and reversing the path order.
- Substituting Manhattan distance for this directed enumeration.
- Multiplying in 32-bit before assigning to a wider type.
- Adding one and counting vertices instead of edges.
- Applying absolute value to an input direction the statement excludes.
