Each `Elephant` receives its original `id` before sorting. Weight is sorted ascending, intelligence descending for ties, then ID ascending for deterministic behavior. The explicit strict comparisons in the DP remain necessary despite this tie ordering.

`length` starts at one and `previous` at −1. A predecessor is stored only when it strictly improves the chain length, so an equal-quality alternative need not replace it. `last` tracks the endpoint of the best chain found so far.

The backward loop follows predecessor indices but appends `animals[i].id`, preserving input identities. Reversing that vector restores increasing-weight order. Its size is printed as the length, ensuring the reported count matches the actual reconstructed output.
