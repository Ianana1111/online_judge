You could try flipping each cell and checking the entire matrix again. Before doing that, ask what a single flip actually affects. It toggles the parity of exactly one row and exactly one column; every other row and column stays unchanged.

That observation tells us what information to collect. For each row and column, retain only whether its number of ones is odd. XOR is enough: every one toggles the value, so a final one means odd parity.

If no row or column is odd, no correction is needed. If exactly one row and one column are odd, their intersection is the only possible repair. In all other cases, one flip cannot repair every violation. Notice that we did not need to remember the original matrix at all.

Track row and column parity; exactly one odd row and one odd column identify the single repairable bit.
