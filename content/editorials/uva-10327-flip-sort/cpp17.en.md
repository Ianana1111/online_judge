The outer input loop creates a fresh case whenever `n` can be read and ends naturally at EOF. The array remains in its original order; sorting it first would erase the very inversions being counted.

Index `i` visits every position and `j` starts at `i+1`, so each unordered pair of distinct positions is examined exactly once in its original left-to-right orientation. The strict test excludes equal values. `inversions` is reset for each data set and uses `long long`, then is inserted into the required output phrase without performing any swaps.

The reason this direct count is valid is mathematical rather than a shortcut in the simulation: every necessary adjacent swap corresponds to reducing the inversion count by one.
