The sort comparator uses only `abs`; distinct absolute sizes guarantee a strict unambiguous order. Each scanned value becomes color `1` or `-1`, independent of its magnitude.

`previous` changes only when a new color run begins. Initial zero differs from both real colors, ensuring a nonempty input selects its first run.

Only the maximum count is required, so selected floor indices need not be stored. The linear scan after sorting produces one answer per test case.
