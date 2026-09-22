While reading input, `low` becomes the largest vessel and `high` becomes the total, establishing valid binary-search bounds and ensuring every tested capacity can hold an individual vessel. In `feasible`, a vessel that triggers a new container is added after resetting `current`, so it is never skipped.

The predicate returns whether the count is at most `containers`. A feasible midpoint remains in the search as the upper bound; an infeasible one moves the lower bound to `mid+1`. When `low==high`, that value is the first feasible capacity and no partition reconstruction is needed.
