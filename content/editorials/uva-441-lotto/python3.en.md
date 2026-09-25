Represent a combination by six increasing indices. After choosing index `i`, recurse only from `i+1`; this simultaneously prevents repeated values and different permutations of the same subset.

The recursive state stores the next index `start` and the current prefix `chosen`. When its size reaches six, print it. Otherwise try candidates in increasing index order, append one, recurse, and remove it on return.

Prune candidates that leave too few elements. If `needed` values remain including the next choice, index `i` is possible only when the suffix length `k-i` is at least `needed`, or equivalently `i <= k-needed`. Trying indices in ascending order and completing each suffix before advancing produces lexicographic output directly.

Choose six indices from the ordered numbers, always advancing the start index; combinations stay ordered and unique.
