`period` accumulates the least common multiple of all cycle lengths. For each phase, the sorting key reads `milk[cow][phase % cycleLength]`; cow index is only a deterministic tie breaker, while the later removal test compares production values and therefore preserves ties.

`first` and `second` are independent monotone pointer arrays, one pair per phase. The second pointer is kept at least one position beyond the first, and both skip dead cows. The zero-based `day` selects a phase; it is incremented before assigning `last`, converting a successful removal to the required one-based date.

After a removal, `idle` resets to zero because the living set changed. A no-removal day increments it. The loop stops when either every cow is gone or a complete common period has passed unchanged, then prints the remaining count and the last true removal day.
