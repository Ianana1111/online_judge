# Resolve every robot instruction to one unit movement

## Problem and constraints

The robot starts at position zero on a line. `LEFT` moves one unit left, `RIGHT` one unit right, and `SAME AS i` performs the same single movement as the earlier instruction numbered `i`. References always point backward and may refer to another reference. There are at most 100 cases and 100 instructions per case. The reference copies an action, not an earlier cumulative position or a history segment.

## Building the approach

Normalize each instruction as soon as it is read. Store `-1` for LEFT and `+1` for RIGHT in a one-based array `movement`. For `SAME AS i`, copy `movement[i]`.

The referenced instruction has already been processed because `i` is smaller than the current number. Even a long reference chain has already collapsed to one of the two unit movements, so no recursive chase is needed. Add the resolved movement to the position exactly once, then continue.

Reinitialize the movement array and position for every test case.

## Walkthrough

`LEFT`, `RIGHT`, `SAME AS 2` resolves to `-1,+1,+1`, leaving position one.

For `LEFT`, `SAME AS 1`, `SAME AS 2`, every instruction is a one-step move left and the result is -3. The third instruction does not jump to a former position and does not replay the first two commands.

## Why it works

Induct over instruction order. Direct LEFT and RIGHT commands are stored with their defined movement. For a reference, the earlier instruction's stored value is correct by induction; copying it therefore gives exactly the referenced action.

The position begins at zero and each step adds the true resolved displacement. After any prefix it equals the sum of the actual movements in that prefix, so after all instructions it is the required final position.

## Complexity

Every instruction is parsed once, giving `O(N)` time and `O(N)` storage. Pre-resolved references avoid quadratic chain traversal.

## Common mistakes

- Copying the cumulative position after instruction `i`.
- Failing to resolve references to other references.
- Mixing one-based instruction numbers with zero-based storage.
- Reading `SAME` but leaving `AS` in the input stream.
- Forgetting to reset position for the next case.
