The target is converted to its absolute value using sign symmetry. `n` and `sum` start at zero, while the explicit `n==0` loop condition forces at least one number and prevents target zero from accepting an empty solution.

Each iteration increments `n` and then adds it, preserving `sum=1+...+n`. The loop continues while the sum is insufficient or the difference is odd. At exit, both complete feasibility conditions hold, so only `n` must be printed. A blank line is emitted before every case except the first.
