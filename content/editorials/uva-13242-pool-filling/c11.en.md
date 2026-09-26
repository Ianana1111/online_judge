Only consecutive jars may be poured. Fix the first jar and extend the last one, enumerating all O(N²) intervals while updating totals with just the newly added jar.

Precompute each jar's deviation heat as volume×(temperature−target). For interval deviation `difference` and total `volume`, its absolute temperature error is |difference|/volume. This avoids rounded average temperatures and supports exact integer comparisons.

Require positive volume, at least half capacity, and no overflow. Since jar volumes are nonnegative, extending an overfull interval cannot make it valid, so stop. An error of exactly five degrees is allowed. Update only for a strictly smaller error; enumerating first and last indices in ascending order preserves the required smallest-index tie break.

C/C++ use 128-bit deviation heat when all inputs fit the proven safe range. Java verifies capacity×maximum per-unit deviation fits long before using primitive arithmetic. Compare fractions through quotient/remainder steps and reciprocals rather than potentially overflowing cross products. Larger values use exact arbitrary-precision arithmetic without truncation.

`small` and `large` implement the same enumeration with different safe numeric representations. Zero error permits immediate return because it is optimal and the earliest tie has already been found. Time is O(N²) and storage O(N), plus integer arithmetic costs.
