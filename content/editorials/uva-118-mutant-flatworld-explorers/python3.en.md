Encode north, east, south, west as indices 0 through 3 in clockwise order. Turn right by adding 1 modulo 4 and left by adding 3 modulo 4. Direction-indexed delta arrays implement forward movement.

For `F`, compute a candidate coordinate before changing state. If it is inside, commit the move. If outside and the current coordinate is scented, ignore only this command. If outside without scent, mark the current coordinate, declare the robot lost, and stop its remaining instructions.

Allocate the scent grid once outside the robot loop. A scent does not block ordinary entry or valid departure from that cell.

A lost robot leaves a scent; future robots ignore an out-of-bounds forward move there, while turns still work.
