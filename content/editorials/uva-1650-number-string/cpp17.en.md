`previous.size()` is current element count, and `prefix[j]` strictly sums ranks below j. I uses it directly; D subtracts it from the total.

`current` has k+1 possible new ranks, including both endpoints where one direction has zero predecessors. Wildcard assigns the full predecessor total to every j. Swapping only after the entire round prevents new counts from contaminating old prefix sums, and final states are summed modulo MOD.
