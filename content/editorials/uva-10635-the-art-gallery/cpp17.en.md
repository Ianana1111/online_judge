`position` initializes to `-1`, distinguishing an absent square from the prince's valid first position zero. Both input loops use inclusive bounds so they consume exactly `p+1` and `q+1` values.

For each common princess square, `lower_bound` finds the first tail at least as large as its prince position. Replacing that tail improves an existing length; reaching `end` extends the longest sequence. Squares absent from the prince are skipped only after their input value is consumed.

The output is `tails.size()` directly. It is independent of board geometry or the physical distance between labels and is not converted to a jump count.
