Flatten a board row-major into a binary string. Generate all four rotations and use their lexicographically smallest string as a canonical key. Rotation-equivalent boards then share one key, while reflections remain distinct.

After each move, test the key against a set of prior completed moves. On the first repeat, record the other player and move number. Continue consuming all `2N` input moves even after the result is known, without changing it, so the next game remains aligned.

After every move, rotate the board four ways and use the lexicographically smallest encoding as its canonical state. A state already seen after an earlier move makes the current player lose; still consume the rest of that game’s input.
