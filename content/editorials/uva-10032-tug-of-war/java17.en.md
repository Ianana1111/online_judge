Java's `BigInteger` supplies the same bitset transition as the C++ reference. Bit `sum` of `possible[count]` means exactly `count` people can total `sum`. For each weight `w`, shift the previous-count row left by `w` and OR it into the current row. Process counts in descending order so one person cannot be chosen twice.

Enumerate every reachable sum for exactly `n/2` selected people and compare it against the complement's weight. Even a team with fewer members can be heavier, so inspect the full range, then print both totals in ascending order.
