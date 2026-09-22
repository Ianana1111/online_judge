# Convert event ranks into one order, then find an LIS

## Problem and constraints

Each line contains a permutation of ranks: the value at index `i` is the rank assigned to event `i`, not the event appearing at position `i`. A student's score is the largest number of events whose relative order agrees with the correct ranking. The events need not be consecutive. Each dataset has 2 to 20 events, and a line containing only one integer begins a new dataset.

## Building the approach

The main difficulty is interpreting the representation correctly. Use the student's order as the positions of a new sequence. If event `i` has student rank `r[i]`, put the correct rank `c[i]` at position `r[i] - 1`. Reading this new sequence from left to right follows the student's event order, while its values describe the correct order.

A chosen set of events agrees in both rankings exactly when their correct-rank values form a strictly increasing subsequence. The answer is therefore the LIS length of the transformed sequence. Since `n` is at most 20, a clear `O(n^2)` dynamic program is enough: `dp[i]` is the longest increasing subsequence ending at `i`.

The parser reads whole lines so it can distinguish a new single-number dataset header from a full ranking line.

## Walkthrough

Suppose the correct rank array is `3, 1, 2` and a student submits `2, 3, 1`. Event 0 is placed at student position 2 with correct rank 3; event 1 goes to position 3 with rank 1; event 2 goes to position 1 with rank 2. The transformed sequence is `2, 3, 1`, whose LIS has length 2. A completely correct ranking produces an increasing sequence of length `n`, while a reversed ranking produces length 1.

## Why it works

Position `r[i] - 1` in the transformed sequence is exactly where event `i` occurs in the student's order, and the stored value `c[i]` is that event's position in the correct order. Thus increasing indices choose events in student order, and increasing values choose those same events in correct order. This gives a one-to-one correspondence between mutually consistent event subsets and increasing subsequences.

For the LIS dynamic program, every increasing subsequence ending at `i` either contains only `i` or extends a subsequence ending at some earlier `j` with `sequence[j] < sequence[i]`. The transition checks every such predecessor, so each `dp[i]` is optimal. The largest ending value is the requested score.

## Complexity

Building the transformed sequence takes `O(n)`. The LIS computation takes `O(n^2)` time and `O(n)` extra space for each student.

## Common mistakes

- Treating each input line as a list of event IDs rather than event-to-rank values.
- Counting positions with equal ranks instead of comparing relative order.
- Finding only a contiguous increasing segment instead of a subsequence.
- Failing to recognize that a one-number line begins a new dataset.
- Reusing the previous dataset's correct ranking.
