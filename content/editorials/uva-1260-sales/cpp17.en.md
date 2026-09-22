The Fenwick array uses sales values as one-based indices. Valid values are positive, so update steps `j += j & -j` always advance, and prefix queries repeatedly remove the lowest set bit.

For every input value, `query(x)` is added before the update loop increments its frequency. The array is zero-initialized for each test case, so the first day naturally contributes zero and no state leaks across cases.
