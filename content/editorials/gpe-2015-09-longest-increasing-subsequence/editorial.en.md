# Maintain minimum tails to find the LIS length

## Problem and constraints

Find the length of the longest strictly increasing subsequence of an unsorted integer sequence. Elements may be skipped but their original order must remain; equal values cannot extend a strict increase. Each case gives `n` followed by `n` values, with `n<=65,535`, and input continues to EOF. Only the length is required. A quadratic dynamic program is too expensive at maximum size.

## Building the approach

Among two increasing subsequences of equal length, keeping the one with the smaller ending value is always at least as useful for future extensions. This lets us summarize every attainable length by one best tail.

Maintain `tails[k]` as the smallest known ending value of a strict increasing subsequence of length `k+1`. For a new value `x`, find the first tail greater than or equal to it using `lower_bound`. If none exists, `x` extends the longest length. Otherwise replace that tail with `x`, improving or preserving the extension opportunity for that length.

The tails remain increasing, so binary search is valid. Their entries need not belong to one common subsequence; only the number of attainable lengths is the answer.

## Walkthrough

For `10,9,2,5,3,7,101,18`, tails progress through `[10]`, `[9]`, `[2]`, `[2,5]`, `[2,3]`, `[2,3,7]`, `[2,3,7,101]`, and `[2,3,7,18]`. The final size is four.

Another 18 replaces the existing 18 rather than increasing the size. This is exactly what strictness requires for equal values.

## Why it works

Assume each tails entry is the minimum possible ending value for its length. Let `p` be the first position whose tail is at least `x`. Every earlier tail is smaller, so `x` can extend a subsequence of length `p` into length `p+1` (or form length one when `p=0`).

No longer subsequence can be extended by `x`, because even its minimum tail is at least `x`. Replacing position `p`, or appending when `p` is past the end, therefore preserves the minimum-tail invariant for every length. After all values, the number of stored lengths is precisely the LIS length.

## Complexity

Each of `n` values performs one `O(log n)` binary search, for `O(n log n)` time. `tails` uses `O(n)` worst-case space.

## Common mistakes

- Using `upper_bound`, which computes a nondecreasing variant.
- Resetting after a decrease and solving only a contiguous-run problem.
- Sorting the input and destroying original order.
- Assuming the current `tails` entries form the actual LIS path.
- Failing to clear state between cases.
