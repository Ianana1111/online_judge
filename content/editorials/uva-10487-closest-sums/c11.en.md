One data set serves several queries, so precompute all sums `a[i]+a[j]` with `i<j` and sort them. The strict index relation ensures that one element is never paired with itself.

For a query `q`, `lower_bound` finds the first sum not smaller than `q`. Among sums on that side, it is the closest possible. Among smaller sums, only its immediate predecessor can be closest. Compare the absolute distances of these two candidates.

Handle boundaries carefully: if the lower bound is the end, begin with the largest sum; if it is the beginning, there is no predecessor. Output the selected sum, not the distance.

Precompute and sort sums of distinct indices for repeated queries; inspect only the binary-search position and its predecessor.
