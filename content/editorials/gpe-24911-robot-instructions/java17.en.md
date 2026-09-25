Normalize each instruction as soon as it is read. Store `-1` for LEFT and `+1` for RIGHT in a one-based array `movement`. For `SAME AS i`, copy `movement[i]`.

The referenced instruction has already been processed because `i` is smaller than the current number. Even a long reference chain has already collapsed to one of the two unit movements, so no recursive chase is needed. Add the resolved movement to the position exactly once, then continue.

Reinitialize the movement array and position for every test case.

Store each instruction’s actual −1 or +1 movement; `SAME AS i` copies that movement, not the old position.
