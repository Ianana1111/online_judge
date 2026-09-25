Define `best[i]` as the maximum sum obtainable from the suffix beginning at index `i`, with `best[n]=0`. Every legal partition has a unique first part. For a nonzero starting digit, extend that first part one digit at a time, and for every value within the limit consider `value + best[j+1]`.

A positive valid part has at most ten digits, so only ten endpoints need examination. Once the accumulated value exceeds the limit, adding more digits can only make it larger and the loop can stop. If `digits[i]` is zero, the only legal first part is the single zero, giving `best[i]=best[i+1]`.

Compute indices from right to left so every required suffix is already solved. Use 64-bit integers both for accumulated candidates and the total sum.

Let best[i] be the maximum sum from position i. A leading zero forces a single zero segment; otherwise try at most ten digits and stop once the segment exceeds signed 32-bit range.
