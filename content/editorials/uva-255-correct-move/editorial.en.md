# Validate state, queen path, forbidden landing, then king escape

## Problem and constraints

Board squares are numbered 0 through 63. Under this problem's rules, the king moves one square orthogonally and the queen any positive distance in a row or column, never through or onto the king. Given king, queen, and proposed queen destination, output the first applicable classification among illegal state, illegal move, move not allowed, continue, and stop.

## Building the approach

Convert indices to row and column. A reusable queen-reach function requires same row or column, different start and destination, destination not king, and king not strictly between endpoints.

First reject overlapping initial pieces, then an invalid queen path. If destination is Manhattan distance one from king, reject it as reachable by king. Otherwise enumerate the king's four in-board neighbors, excluding the queen square, and test whether the new queen can reach each. Any unattacked neighbor means Continue; none means Stop.

## Walkthrough

King 17 and queen 49 moving to 9 is vertically aligned but crosses 17, so it is illegal. Moving to 25 does not cross the king but lands adjacent, so it is not allowed. The stated corner trap after queen moves to 49 leaves no legal king neighbor and yields Stop.

## Why it works

The reach predicate enumerates exactly the four orthogonal queen rays while enforcing king blocking. King candidates are exactly its in-board orthogonal neighbors, with occupied and queen-reachable squares removed. Thus the final escape test is complete. Evaluating earlier classifications first preserves the problem's required priority.

## Complexity

Each record uses constant time and space, checking at most four king moves.

## Common mistakes

- Allowing diagonal queen movement.
- Letting the queen cross the king.
- Allowing a zero-length move.
- Treating index-adjacent squares across row boundaries as neighbors.
- Checking lower-priority conditions before illegal state.
