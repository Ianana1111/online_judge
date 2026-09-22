One initial `getline` consumes the remainder of the test-count line. Every later line is parsed independently with `istringstream`, so all weights belong to exactly one case and no count prefix is assumed.

DP is allocated only for an even total. `reachable[0]=true` represents the empty subset. Each item loops downward from `target` to its own weight, ensuring `reachable[sum-w]` has not been created by the same item.

Only `reachable[target]` is needed for the verdict. The actual partition and equal item counts are irrelevant, and each case prints exactly uppercase `YES` or `NO`.
