The prime table is built once and shared by all queries, with indices zero and one explicitly cleared. The candidate loop begins at two and includes `n/2`, while both lookup indices stay within the legal table range.

`count` resets for every input and increments for every valid pair; there is no early break because all representations are required. The zero sentinel produces no output. Unlike the maximum-gap Goldbach problem, this program accumulates a complete count rather than storing one representative pair.
