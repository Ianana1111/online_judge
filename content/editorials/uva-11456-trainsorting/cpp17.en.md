Each decimal weight removes leading zeros, then ranks by digit count and lexicographic order for equal lengths. The pair retains the original arrival index, so ranking changes only comparison values, not sequence order.

`rise` and `fall` begin at one for every nonempty start. Processing right to left guarantees all `j>i` states are ready. Strict rank comparisons extend the corresponding chain. `answer` starts at zero, so an empty case remains zero, and subtracting one removes the shared start from the merged length.
