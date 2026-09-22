`compare` uses the scaled vectors from the vertex average. The half-plane test handles the angular wraparound; only vectors within the same half-plane are ordered by the sign of their cross product. `cmp_to_key` lets `sorted` use that geometric comparator without converting coordinates to floating point.

The cyclic index `(i + 1) % n` includes the closing edge. `area` holds twice the signed area, while `moment_x` and `moment_y` hold the corresponding numerator sums. Each coordinate is therefore passed to `fixed_ratio` with denominator `3 * area`.

`fixed_ratio` normalizes the denominator's sign, scales the absolute numerator, and performs integer rounding to three decimal places. Its sign check suppresses a negative zero after rounding. The token loop stops on `count < 3` before requesting any further coordinate pairs.
