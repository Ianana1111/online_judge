Keeping the last seven base-`b` digits is equivalent to taking the number modulo `b^7`. We never need the potentially enormous complete integer. Compute `modulus = b^7`, then read the source-base-`a` number from left to right using

`value = (value * a + digit) % modulus`.

After the whole string, `value` is precisely the part visible on the target display. Extract seven base-`b` digits by repeated division, filling positions from right to left. If the remaining value becomes zero, later remainders are zero and automatically provide the required padding.

The display keeps only seven rightmost target-base digits. Maintain the source value modulo target_base⁷, then extract exactly seven digits from right to left.
