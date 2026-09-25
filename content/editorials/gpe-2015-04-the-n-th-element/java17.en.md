Imagine cutting the merged sorted order after its first `N` elements. If the left side takes `takeA` elements from array A, it must take `takeB=N-takeA` from B. Therefore one cut determines the other.

The partition is correct when every left element is at most every right element. Because each individual array is sorted, only two cross-boundary comparisons are needed: `aLeft <= bRight` and `bLeft <= aRight`.

If `aLeft>bRight`, too many A elements were taken, so reduce `takeA`. If `bLeft>aRight`, too few A elements were taken, so increase it. Binary-search `takeA` from zero to N. Empty sides use negative or positive infinity sentinels.

At a valid partition, the left side contains exactly the first N elements, so its maximum `max(aLeft,bLeft)` is the N-th smallest value.

Do not materialize the arrays. Binary-search how many A elements lie in the first N positions; B’s count follows. Once both cross-boundary comparisons hold, the maximum left value is the answer.
