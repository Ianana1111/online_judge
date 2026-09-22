Array `a` counts secret digits once per game, while `b` is value-initialized for every guess. The program reads all `N` guessed values before testing the first one for the guaranteed all-zero sentinel, so no tokens are left to corrupt the next game.

The same pass builds `b` and counts equal positions in `strong`. A loop over digits 1 through 9 then sums the smaller multiplicities into `total`; subtracting `strong` produces the weak count. The game header and the four-space hint indentation are emitted exactly, and the terminating guess produces no hint line.
