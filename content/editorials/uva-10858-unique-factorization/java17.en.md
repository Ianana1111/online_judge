Enforce nondecreasing factors during search to avoid generating permutations. The recursive state contains remaining product `rest`, minimum allowed next factor `minimum`, and the chosen path.

If a factorization will continue beyond the next factor, its smallest remaining factor cannot exceed `sqrt(rest)`. Enumerate every divisor from `minimum` through that inclusive boundary, append it, recurse on `rest/divisor` with the same value as the new lower bound, then backtrack.

At any state, another valid choice is to stop splitting and use the whole `rest` as the final factor. Record it only when the path is already nonempty and `rest>=minimum`; this enforces at least two factors and nondecreasing order.

Finally sort the vectors with numeric lexicographic comparison.

Only choose factors no smaller than the previous one, avoiding reordered duplicates. At each state, split by a divisor through the square root or finish with the remaining factor.
