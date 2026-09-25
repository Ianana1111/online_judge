Initialize two flags, `increasing` and `decreasing`, to true. For every adjacent pair, invalidate increasing if the next value is not greater, and invalidate decreasing if it is not smaller. After all comparisons, the sequence is ordered when either flag survives.

First and last values alone are insufficient, and the first pair cannot guarantee the direction of every later pair. One local reversal breaks global monotonicity.

Two `all` checks examine the nine adjacent pairs; either strict direction is ordered.
