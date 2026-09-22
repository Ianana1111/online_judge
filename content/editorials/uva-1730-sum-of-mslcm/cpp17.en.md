`left` is the first unprocessed divisor, and `right=n/quotient` is the last with the same quotient. The arithmetic-series formula sums all d in that block.

Advancing to `right+1` guarantees progress and exact adjacency. The loop computes divisor sums from one through n, so output subtracts one. Every query resets its accumulator, and zero exits without output.
