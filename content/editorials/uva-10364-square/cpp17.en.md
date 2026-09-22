The remainder table starts at `-1`, which is distinct from a reachable completed-side remainder of zero. Each stick owns its own bit even when several lengths are equal.

Adding one bit always creates a numerically larger mask, so increasing mask order propagates reachability to states that have not yet been processed. The program checks `remainder+stick <= side` before applying `% side`; reversing those steps would allow a stick to pass through a corner.

The total-divisibility and longest-stick checks only reject obvious failures. Final acceptance still depends on reachability of the complete mask with remainder zero.
