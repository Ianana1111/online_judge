# Merge overlapping boundary intervals and sum connected stone areas

## Problem and constraints

Up to 50,000 axis-aligned rectangular stones have no positive-area overlap. Sharing an edge or even one corner makes stones connected, and contact is transitive. Find the largest total area of a connected stone surface. Coordinates may be negative.

## Building the approach

Represent each vertical side by fixed `x`, a closed `y` interval, and stone ID; do the analogous representation for horizontal sides. Sort by fixed coordinate and interval start. Within one line, closed intervals whose next start is at most the current farthest end belong to the same contact group, so union their stones in a DSU. Process both orientations.

Track the farthest end and an interval attaining it while scanning a group. After all unions, component area is simply the sum of member rectangle areas because interiors do not overlap. Store this sum at DSU roots and take the maximum.

## Walkthrough

Unit squares at `(0,0)` and `(1,1)` meet only at `(1,1)` but still merge because closed intervals meet at an endpoint. A narrow stone resting in the middle of another's top edge may share no vertical side coordinate, so horizontal sides must also be processed.

## Why it works

Two non-overlapping axis-aligned rectangles touch exactly when some pair of collinear vertical or horizontal boundary intervals has nonempty closed intersection; corner contact is included. The sorted sweep merges precisely every connected interval group on each line, and DSU takes the transitive closure of all such contacts. Unioning distinct roots adds every non-overlapping stone area exactly once, so each root total and their maximum are correct.

## Complexity

Sorting `2N` sides in each orientation costs `O(N log N)`; sweeping and DSU operations cost `O(N alpha(N))`, with `O(N)` storage.

## Common mistakes

- Requiring positive overlap and losing corner contacts.
- Checking only one side orientation.
- Carrying an interval group across different fixed coordinates.
- Adding area again for repeated contacts inside one component.
- Returning the area of all stones regardless of connectivity.
