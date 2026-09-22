`DSU::join` returns true only when two different components are merged, so `chosen` counts actual reductions in component count rather than every inspected edge. Squared distance is the first tuple field; endpoint fields only provide deterministic ordering for equal distances.

After each successful union, `answer` becomes that edge's squared length. The loop stops when `chosen == n-satellites`. Since the constraints guarantee fewer channels than outposts, at least one edge is selected.

All coordinate subtraction and squaring use `long long`; the largest squared distance fits safely. `sqrtl` is called only once at output, where fixed formatting produces the required two decimal places. Coincident coordinates, if present, simply create valid zero-distance edges.
