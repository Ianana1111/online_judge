Let `previous[r]` count length-k relative permutations whose last element has zero-based rank r. Append a new final element with rank j among k+1 values; old ranks at least j shift upward, preserving all earlier comparisons.

For I, old last rank must satisfy `r<j`, so `current[j]` is a prefix sum before j. For D, `r>=j`, so use the suffix from j. Wildcard accepts every predecessor. Prefix sums make each rank transition constant time. Start from one single-element permutation and sum all final ranks after the signature.

Track only the relative rank of the last value. For a new rank j, I sums smaller prior ranks, D sums prior ranks at least j, and ? sums all. Prefix sums make each extension linear.
