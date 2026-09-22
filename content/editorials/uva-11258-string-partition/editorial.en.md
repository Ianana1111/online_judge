# Try every legal first number with a suffix dynamic program

## Problem and constraints

Split a string of at most 200 digits into nonnegative signed 32-bit integers so that their sum is maximum. Each part must be at most 2,147,483,647 and may not have a leading zero, except that the single digit `0` is valid. The final sum can exceed 32 bits. There may be up to 500 test cases.

## Building the approach

Define `best[i]` as the maximum sum obtainable from the suffix beginning at index `i`, with `best[n]=0`. Every legal partition has a unique first part. For a nonzero starting digit, extend that first part one digit at a time, and for every value within the limit consider `value + best[j+1]`.

A positive valid part has at most ten digits, so only ten endpoints need examination. Once the accumulated value exceeds the limit, adding more digits can only make it larger and the loop can stop. If `digits[i]` is zero, the only legal first part is the single zero, giving `best[i]=best[i+1]`.

Compute indices from right to left so every required suffix is already solved. Use 64-bit integers both for accumulated candidates and the total sum.

## Walkthrough

`2147483647` may remain one part and contributes the exact upper limit. `2147483648` cannot remain whole; one optimal split is `214748364 + 8 = 214748372`. The string `000` must become three individual zero parts and sums to zero. Repeated near-limit parts can make the final answer much larger than a 32-bit integer.

## Why it works

Every legal partition of suffix `i` chooses exactly one legal first segment `i..j`, followed by a legal partition of suffix `j+1`. For a fixed first segment, replacing the remainder with `best[j+1]` cannot decrease the result. The transition checks every legal first segment, so its maximum is exactly the optimal suffix value. Starting from the empty suffix proves all states by backward induction. The separate zero transition admits the one legal zero representation and excludes every leading-zero part.

## Complexity

At most ten endpoints are checked per position, giving `O(10L)`, or simply `O(L)`, time. The DP array uses `O(L)` space.

## Common mistakes

- Storing the total sum in 32 bits.
- Allowing parts such as `01` or `000`.
- Rejecting the valid limit by using `>= 2147483647`.
- Greedily taking the longest legal prefix without considering the suffix.
- Accumulating a candidate in `int` and overflowing before checking the limit.
