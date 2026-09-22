# Track all six spatial faces and permute them for every roll

## Problem and constraints

A die initially shows 1 on top, 2 to the north, and 3 to the west. Opposite faces sum to seven, so bottom, south, and east contain 6, 5, and 4. Apply up to 1024 commands `north`, `south`, `east`, or `west`, then print the number on top. A zero command count ends input, and every game resets to the initial orientation.

## Building the approach

The top face alone is not enough state: two orientations can share a top number but have different side faces, producing different future rolls. Store the number currently occupying each spatial position: top, bottom, north, south, west, and east.

Rolling north cycles four positions: the old south becomes top, top becomes north, north becomes bottom, and bottom becomes south. East and west stay fixed. The other three commands are analogous rotations.

Copy the complete old orientation before each command and construct the new six positions only from that copy. Otherwise an assignment made early in the same rotation could be read again as if it were still an old face.

## Walkthrough

Initially the south face is five. After one `north` roll, that face moves on top, so the answer is five.

For `north`, `east`, `south`, the first roll places five on top and one on the north. The east roll places the old west face three on top while leaving the north face one unchanged. The final south roll moves that north face to the top, giving one. Four rolls in any single direction should restore the initial orientation, which is a useful consistency check.

## Why it works

The initial array exactly matches the six specified die faces. Assume it correctly describes the orientation before a command. The update for that command moves the four faces around the appropriate rotation cycle and leaves the two faces on the rotation axis unchanged, exactly matching a physical roll. Therefore the new array is also correct.

By induction, the array remains correct after every command. Its top-position entry at the end is consequently the required number.

## Complexity

For `K` commands, time is `O(K)` and the six-entry state uses `O(1)` space. Commands do not need to be stored.

## Common mistakes

- Moving the old north face to the top on a north roll; the old south face actually rises.
- Updating faces in place and reading a value already overwritten during the same roll.
- Tracking only top and bottom and losing side orientation.
- Carrying the final orientation into the next game instead of resetting it.
