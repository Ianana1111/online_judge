All quantities, including the binary-search product, are `long long`. `excess` subtracts the `n-1` edges already needed for connectivity.

The search keeps the first feasible core size in `[1,n]`. Feasible `mid` values move `high` down; infeasible ones move `low` above `mid`. The capacity expression remains nondecreasing from one onward, and termination prints the number of vertices left outside the core.
