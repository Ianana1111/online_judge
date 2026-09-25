It is tempting to maximize the burger count directly, but that reverses the problem's priorities. Ask a different question: for every exact amount of used time, what is the largest burger count that can achieve it?

Let `best[time]` be that count, and use `-1` for an unreachable time. The empty plan gives `best[0] = 0`. Any nonempty plan ending at `time` must take either an `M`-minute burger after a plan for `time-M`, or an `N`-minute burger after a plan for `time-N`. We extend only reachable states and keep the larger count.

After filling the table, scan downward from `T` to find the greatest reachable `used`. This minimizes `T-used`. The value already stored at that time resolves the second priority.

Maximize burgers for each reachable time, then scan down from t to minimize leftover time first.
