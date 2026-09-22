The first two mask bits remove top and bottom rows; the next two remove left and right columns. Because dimensions are at least two, remaining sizes never become negative. `choose[0][0]=1` supports empty-cell intersections correctly.

Checking `k>cells` before table access handles input `K` above 400. Popcount selects the inclusion-exclusion sign, `long long` holds the signed temporary sum, and final double-modulo normalization returns a nonnegative residue.
