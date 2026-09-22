`left` starts above every legal position and `right` below every legal position. Each input updates both, so after at least one guaranteed shop they are the true extremes.

The direct expression `2 * (right-left)` naturally returns zero for a single shop or equal positions. Both sentinels are reinitialized for every test case, and no position array is required.
