Start by separating the input numbers from what the question actually checks: their adjacent differences. Sorting the input would destroy those adjacencies, so keep its order.

There are N − 1 differences and N − 1 required values. That matching count is useful: if each difference lies in the required range and none repeats, there is no room for a missing value. We do not need a separate search for every required difference.

Use a Boolean array indexed by the difference. For each new number, compare it with the previous number, reject zero or a difference at least N, and otherwise check whether that index has already been seen. A sum alone is insufficient: repeated differences can compensate for missing ones.

Even after detecting a failure, keep reading the remaining numbers. Otherwise they would be mistaken for the next sequence's length.

Use differences as indexes from 1 to n−1; an out-of-range or repeated difference makes a complete set impossible.
