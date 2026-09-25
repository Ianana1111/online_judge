If every sign is positive, the sum is `S=N(N+1)/2`. Flipping number `x` from positive to negative changes the sum by `2x`, not `x`. To reach `|k|`, it is necessary that `S>=|k|` and `S-|k|` be even.

These conditions are also sufficient because numbers 1 through N can form every subset sum from zero through S. Select a subset totaling `(S-|k|)/2` and flip exactly those signs.

Negative and positive targets have equal minimum length: negating every sign changes one into the other. Starting at `N=1`, accumulate the triangular sum until both magnitude and parity conditions hold. The zero target reaches `N=3`, represented by `1+2-3=0`.

Absolute value handles positive and negative targets symmetrically; cases are separated by a blank line.
