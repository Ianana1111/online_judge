`present` has `n+1` entries so IDs can be used directly; index zero is ignored. All badges are read before output begins, preventing premature missing decisions.

`missing` becomes true only when an absent ID is printed. IDs are scanned inclusively from one through `n` and each required trailing space is emitted. If no such ID exists, only `*` is printed. The outer loop naturally handles all cases until EOF.
