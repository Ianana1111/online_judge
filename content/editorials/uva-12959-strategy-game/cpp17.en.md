`total` is zero-initialized for each case, and `+=` preserves all earlier rounds. The loop order mirrors the chronological record exactly.

`winner` begins at valid zero-based player zero, including one-player cases. The `>=` comparison advances across ties, and `winner+1` restores formal IDs. The joint-zero sentinel is rejected before any empty vector or invalid index is created.
