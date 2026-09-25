Once a denominator is chosen, the numerator is uniquely `denominator*N`; there is no need for a nested numerator search. The smallest possible integer value of a five-digit representation with unique digits is `01234`, or 1234. Enumerate upward while the numerator remains at most 98765.

Check both values with one ten-bit mask. Extract exactly five digits from each value, even after integer division reaches zero, so a leading zero occupies a real position. Reject a bit already present; after ten distinct positions, the mask necessarily contains all digits 0 through 9.

Increasing denominators produce increasing numerators because `N` is positive, so output order is automatic.

Treat the denominator as five digits including a leading zero; enumerate and check that all ten digits occur exactly once.
