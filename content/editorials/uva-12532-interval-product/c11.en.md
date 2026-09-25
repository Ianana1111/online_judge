A product is zero if its range contains any zero. Otherwise its sign is negative exactly when the negative count is odd. Store per-position zero and negative indicator values in two Fenwick trees, which provide range counts by prefix subtraction.

For an assignment, add the difference between the new and old indicators to each tree, then store the new value. For a query, test the zero count first and otherwise inspect negative parity.

Only zero count and negative-count parity affect the product sign. Keep one Fenwick tree for each indicator, update by new minus old, and check zeros before negative parity.
