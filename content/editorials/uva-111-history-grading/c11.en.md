The main difficulty is interpreting the representation correctly. Use the student's order as the positions of a new sequence. If event `i` has student rank `r[i]`, put the correct rank `c[i]` at position `r[i] - 1`. Reading this new sequence from left to right follows the student's event order, while its values describe the correct order.

A chosen set of events agrees in both rankings exactly when their correct-rank values form a strictly increasing subsequence. The answer is therefore the LIS length of the transformed sequence. Since `n` is at most 20, a clear `O(n^2)` dynamic program is enough: `dp[i]` is the longest increasing subsequence ending at `i`.

The parser reads whole lines so it can distinguish a new single-number dataset header from a full ranking line.

The value at event index i is that event’s rank, not an event ID at that position. Reorder correct ranks into the student’s event order, then find the LIS length.
