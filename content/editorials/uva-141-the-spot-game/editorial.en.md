# Canonicalize every board under its four rotations

## Problem and constraints

Two players alternately add or remove a spot on an `N` by `N` board for at most `2N` legal moves. A player loses when the resulting board equals any earlier completed-move board under rotation by 0,90,180, or 270 degrees. The initial untouched empty board is not preloaded in this platform's history; a later empty board is stored normally. Otherwise the game draws.

## Building the approach

Flatten a board row-major into a binary string. Generate all four rotations and use their lexicographically smallest string as a canonical key. Rotation-equivalent boards then share one key, while reflections remain distinct.

After each move, test the key against a set of prior completed moves. On the first repeat, record the other player and move number. Continue consuming all `2N` input moves even after the result is known, without changing it, so the next game remains aligned.

## Walkthrough

On a 2-by-2 board, add at top-left, add at bottom-right, then remove bottom-right. Move three restores move one's board, so player 1 loses and player 2 wins. Producing an empty board for the first time does not repeat the initial state, because it was not stored.

## Why it works

The four square rotations form a closed group, so rotating either equivalent board generates the same candidate set and the same minimum. Equal minima conversely mean both original boards rotate to one common board. The seen set therefore represents exactly all previous rotation classes. Processing moves in order and freezing the first match gives the earliest loss, while move parity identifies its opponent as winner.

## Complexity

There are at most `2N` moves, each creating four `N^2` strings. With an ordered set, worst-case time is `O(N^3 log N)` and storage `O(N^3)` for at most 100 keys.

## Common mistakes

- Comparing only the unrotated orientation.
- Including reflections.
- Preloading the initial empty board against platform rules.
- Naming the repeating player as winner.
- Stopping input consumption after a win.
