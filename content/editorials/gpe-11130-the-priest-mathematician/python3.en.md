All queries are read first so the table is built only through the largest requested disk count. Its zero initialization supplies `moves[0] = 0`.

For each positive count, `best = 2 * moves[disks - 1] + 1` evaluates m = 1. The loop then starts `bottom = 2` and `three_pegs = 3`. Each iteration evaluates the matching split, possibly lowers `best`, advances the group size, and updates the three-peg cost by `2 * three_pegs + 1`, generating 3, 7, 15, and so on.

The condition `three_pegs < best` is the safe lower-bound pruning rule. Equality cannot improve the minimum, so it need not be explored. After preprocessing, results are printed in the original query order with their complete decimal digits.
