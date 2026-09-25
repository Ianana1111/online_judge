Define `prefix(n)` for numbers 1 through n, then subtract `prefix(min-1)` from `prefix(max)`. For place value `factor`, split n into `higher`, current `digit`, and `lower`.

For nonzero d, complete higher cycles contribute `higher*factor`; the partial cycle contributes zero, `lower+1`, or `factor` according as current digit is below, equal to, or above d. For zero, the first apparent cycle represents missing leading positions and must be removed: only when `higher>0`, add `(higher-1)*factor` plus `lower+1` if current digit is zero, otherwise `factor`.

Count digit occurrences from 1 through n by decomposing each decimal position into higher, current, and lower parts. Handle zero separately so leading zeroes are excluded. Subtract two prefixes for the requested range.
