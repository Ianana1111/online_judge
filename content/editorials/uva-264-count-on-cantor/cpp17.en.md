Binary search retains mid when its triangular number reaches n and otherwise moves to `mid+1`, converging on the first sufficient diagonal.

Offset subtracts exactly `T(diagonal-1)`, so it is one-based. Parity selects numerator direction; denominator follows from sum `diagonal+1`. Output keeps both raw integers separated by slash and adds no reduction or extra blank line.
