# Compare each wall with the immediately previous wall

## Problem and constraints

Mario begins on the first wall and jumps through adjacent walls to the right. Count a high jump when the next wall is taller and a low jump when it is shorter; equal heights count neither. Each case has from 1 to 49 walls.

## Building the approach

Read the first height into `previous`. For each later `current` height, increment `high` when `current>previous`, increment `low` when `current<previous`, and do nothing on equality. Then always assign `previous=current` so the next comparison uses adjacent walls.

There are exactly `N-1` jumps. Reaching the first wall is the starting position, not a jump from ground level, and the magnitude of a height difference does not affect the count.

## Walkthrough

Heights `1,4,2,2,3` produce up, down, level, up, so the counts are high 2 and low 1. A single wall has no moves and both counts are zero. Jumping from height 1 to 10 is one high jump, not nine.

## Why it works

Each loop iteration corresponds to the unique jump from wall `i-1` to wall `i`, with `previous` and `current` storing exactly their heights. The three comparison outcomes are mutually exclusive and correspond to high, low, and uncounted level movement. Processing all adjacent pairs therefore yields exact totals.

## Complexity

Each case takes `O(N)` time and `O(1)` extra space.

## Common mistakes

- Counting the initial placement on the first wall.
- Treating equal heights as low jumps.
- Summing height differences instead of jump events.
- Never updating `previous`.
- Printing low before high.
- Reading a nonexistent second wall when `N=1`.
