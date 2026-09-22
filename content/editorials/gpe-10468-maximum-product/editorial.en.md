# Let the small input size simplify the search

## Problem and constraints

For a sequence of 1 to 18 integers between −10 and 10, find the largest positive product of a nonempty contiguous interval. If no positive product exists, report zero. Input continues until EOF. The required case line is followed by a blank line.

## Building the approach

A negative running product looks unpromising, but multiplying by another negative number can make it the best answer. That makes a direct copy of a maximum-subarray-sum rule unsafe. Before designing a more elaborate state, look at N: even at 18, there are only 171 nonempty intervals.

Enumerate a left endpoint, start a product at one, and extend the right endpoint one position at a time. Each extension needs only one multiplication because the previous product already contains the rest of that interval. Compare every product with an answer initialized to zero.

Do not stop on a negative product. After zero, products for that fixed left endpoint stay zero, but later left endpoints still explore intervals entirely to the right of it. No interval is allowed to jump over the zero.

## Walkthrough

For `−2, −3, 4`, the intervals beginning at the first element produce −2, 6, and 24. The final value is best. For `−2, 0, −3`, multiplying the two negatives would be positive only if we illegally skipped the middle zero; the correct answer is zero. A single `−5` also gives zero under the output rule.

## Why it works

Every nonempty contiguous interval has exactly one pair of left and right endpoints, and the two loops visit every such pair. The running product equals that interval's product by induction on the right endpoint. Taking the maximum with an initial zero therefore selects the largest positive product, or leaves zero when none exists.

## Complexity

O(N²) time, O(N) input storage, and O(1) additional state. The largest possible product magnitude is 10¹⁸, which fits in a signed 64-bit integer.

## Common mistakes

- Selecting nonadjacent positive values.
- Stopping after the product becomes negative.
- Returning a negative result when no positive interval exists.
- Using a 32-bit product or forgetting to reset it for each left endpoint.
