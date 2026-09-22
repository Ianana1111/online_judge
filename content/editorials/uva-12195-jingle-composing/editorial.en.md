# Scale musical durations to count exact measures with integers

## Problem and constraints

A song uses `/` to surround and separate measures. Notes `W`, `H`, `Q`, `E`, `S`, `T`, and `X` last `1`, `1/2`, `1/4`, `1/8`, `1/16`, `1/32`, and `1/64`. Count the measures whose total duration is exactly one. Each song has length 3 through 200, and a line containing only `*` ends the input.

## Building the approach

The denominators are powers of two and all divide 64. Multiplying every duration by 64 changes the note values to `64, 32, 16, 8, 4, 2, 1`; a complete measure now has the exact integer sum 64. This avoids approximate arithmetic entirely.

Scan the song from left to right. Add each note's scaled duration. At every slash, count the preceding measure only when its sum equals 64, then reset the sum. The leading slash simply examines an empty sum, and the trailing slash performs the final real check.

## Walkthrough

For `/HH/QQQQ/W/HW/`, the first three nonempty measures sum to `32+32`, `4*16`, and `64`, so all are valid. The final measure sums to `32+64=96` and is rejected. Similarly, 64 `X` notes are valid, while 63 are short and 65 are long.

## Why it works

Scaling every note by the same positive factor preserves whether a measure totals one. During the scan, `sum` is exactly the scaled duration since the previous slash. Consequently each slash evaluates exactly one measure, counts it precisely when that duration is 64, and resets the invariant for the next measure. Every measure is considered once.

## Complexity

For a song of length `L`, the scan takes `O(L)` time and `O(1)` auxiliary space beyond the input string and fixed seven-entry duration table.

## Common mistakes

- Accepting sums greater than or equal to 64.
- Carrying one measure's sum into the next.
- Assigning `X` the duration of `T`.
- Forgetting that the trailing slash closes the final measure.
- Counting the empty prefix before the leading slash.
