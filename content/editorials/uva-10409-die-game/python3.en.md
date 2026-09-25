The top face alone is not enough state: two orientations can share a top number but have different side faces, producing different future rolls. Store the number currently occupying each spatial position: top, bottom, north, south, west, and east.

Rolling north cycles four positions: the old south becomes top, top becomes north, north becomes bottom, and bottom becomes south. East and west stay fixed. The other three commands are analogous rotations.

Copy the complete old orientation before each command and construct the new six positions only from that copy. Otherwise an assignment made early in the same rotation could be read again as if it were still an old face.

The six variables represent spatial positions, not fixed face labels; update from the old state on every roll.
