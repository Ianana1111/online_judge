Both function parameters and `diagonal` are `long long`, so `diagonal*(diagonal+1)` is already wide during multiplication. Dividing by two and adding `x` produces the zero-based global path index.

The main loop reads start and destination coordinates in their given order and subtracts the start index from the destination index. The reachability guarantee makes the result nonnegative, so no absolute value or path simulation is needed.

Each test prints its one-based case number, colon, and exact integer step count.
