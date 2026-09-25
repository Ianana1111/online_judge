Diagonal d contains d entries whose numerator plus denominator is d+1. The first d diagonals contain triangular number `T(d)=d(d+1)/2`. Binary-search the smallest d with `T(d)>=n`.

The one-based offset is `n-T(d-1)`. On even diagonals numerator increases from one to d, so it equals offset. On odd diagonals it decreases, so use `d+1-offset`. Denominator is the fixed sum minus numerator.

Diagonal d ends at triangular number d(d+1)/2; find it first, then use parity to orient the numerator.
