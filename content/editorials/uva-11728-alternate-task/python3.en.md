Because `n` itself is a divisor, its divisor sum is at least `n`; therefore every candidate for `S<=1000` lies within 1 through 1000. Compute all divisor sums with a sieve: for each divisor `d`, add `d` to every positive multiple.

Then scan `n` in increasing order. If its sum lies within query range, assign `largest[sum[n]]=n`. Later, larger values overwrite earlier ones sharing the same divisor sum. Initialize the reverse table to -1 for sums with no preimage.

Keep `-1` when no number matches and do not count the zero sentinel as a case.
