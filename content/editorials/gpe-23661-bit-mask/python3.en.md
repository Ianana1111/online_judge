Binary values are ordered by their highest differing bit. We can therefore decide `M` from bit 31 down to bit 0, while keeping the already chosen high prefix and asking whether lower bits can still complete a value inside the interval.

When the current bit of `N` is zero, setting the bit of `M` improves the OR at the most significant undecided position. We should do so whenever the smallest number with that prefix, `mask|bit`, does not exceed `U`. This cannot lose the lower bound: raising the prefix only helps reach `L`, and lower bits remain available.

When `N` already has the bit, either choice gives the same OR bit. The tie rule prefers zero in `M`. It is forced to one only if leaving it zero and setting every lower bit, represented by `mask|(bit-1)`, still cannot reach `L`.

Decide M from high bit to low. Set a bit absent from N whenever the upper bound permits; for bits already in N, set them only when required to reach the lower bound.
