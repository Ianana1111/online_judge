# Track zero counts and negative parity with two Fenwick trees

## Problem and constraints

Maintain up to 100,000 integers under point assignments and inclusive range-product sign queries. Values lie from -100 through 100, and all query signs for one case must be concatenated on one line. The actual product may overflow and is unnecessary.

## Building the approach

A product is zero if its range contains any zero. Otherwise its sign is negative exactly when the negative count is odd. Store per-position zero and negative indicator values in two Fenwick trees, which provide range counts by prefix subtraction.

For an assignment, add the difference between the new and old indicators to each tree, then store the new value. For a query, test the zero count first and otherwise inspect negative parity.

## Walkthrough

The range `[-1,0,1]` has sign zero. Changing the middle value to -1 leaves two negatives and gives `+`; changing the first to 1 leaves one negative and gives `-`. Assigning zero repeatedly must not keep increasing the zero count.

## Why it works

Initialization and difference updates maintain exact indicator sums in both trees. Prefix subtraction yields exact inclusive range counts. Zero absorbs multiplication, and without zero each negative factor flips the sign once, so the zero-first and parity rule is precisely equivalent to multiplying every value.

## Complexity

Initialization takes `O(N log N)`, each command `O(log N)`, and storage `O(N+K)` including the output string.

## Common mistakes

- Multiplying values and overflowing.
- Checking negative parity before zero presence.
- Adding a new indicator without removing the old one.
- Subtracting `prefix(left)` and excluding the left endpoint.
