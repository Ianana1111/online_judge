Weights and loads retain input order while the outer index runs from `n-1` to zero. `best[0]=0` makes every box eligible to form a single-box stack.

The height loop descends from the current maximum. A newly written `best[h+1]` therefore cannot serve as a source for the same box. `height` records only the largest reachable state and may safely grow during this downward scan.

The load condition checks only `best[h]`. The current box weight is added after feasibility to become the total weight seen by a future lower box.
