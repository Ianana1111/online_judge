First scan values for positivity and strict increase. Then enumerate exactly all unordered index pairs with repetition: i from zero to N-1 and j from i to N-1. Insert each sum into a set. A failed insertion means another distinct index pair already produced that sum.

Starting j at i includes required self-pairs such as `b_i+b_i`. Starting earlier would also enumerate symmetric `(j,i)` and falsely flag every normal off-diagonal pair as duplicate.

Read the whole sequence before validation so a failure never leaves input misaligned.

Require positive strictly increasing values, then enumerate sums for i≤j; any duplicate sum violates B2.
