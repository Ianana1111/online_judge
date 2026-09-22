`distance` is the nonnegative endpoint difference. The zero case returns before the square branch. `sqrtl` supplies an initial root, then two integer-square loops correct it to the exact floor.

The branches represent the perfect square, the inclusive even-step capacity, and the remaining interval below the next square. The second comparison includes equality because `root^2+root` is exactly the largest distance reachable in `2*root` steps. No explicit step sequence is needed once these capacity thresholds are known.
