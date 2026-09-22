# Parse every complete decimal run length before expanding

## Problem and constraints

Decode run-length text such as `A2B4D1A2` into `AABBBBDAA`. Every uppercase letter is followed by one or more decimal digits, and the decoded length is at most 200. Counts may contain multiple digits, and run order must be preserved.

## Building the approach

Scan with index `i`. Read one letter, reset `count` to zero, then consume every following digit with `count = count*10 + digit`. When the next letter or end of string is reached, append `count` copies of that letter. Repeat until input is exhausted.

Runs of the same letter separated by another run must remain separate in output order. The count is local to each run, and expansion must occur even when the digit scan ends at the string boundary.

## Walkthrough

`A12` expands to twelve A characters rather than treating 2 as another run. `A2B1A3` becomes `AABAAA`, preserving B between the A runs. A final `Z200` still expands fully when the parser reaches end of string.

## Why it works

At each outer iteration, `i` points to exactly the next run's letter. The inner loop applies decimal place value and consumes exactly that run's following digits, so `count` is its specified repetition count. Appending that many copies preserves the correct decoded prefix invariant. Repeating across all runs produces the complete decoding in order.

## Complexity

For encoded length `E` and decoded length `D`, time is `O(E+D)` and output storage is `O(D)`.

## Common mistakes

- Reading only one digit of a multi-digit count.
- Failing to reset count for a new run.
- Dropping the final run at end of string.
- Merging separated runs of the same letter.
- Adding digits without multiplying the old count by ten.
