In base B, a numeral is a sum of digit values times powers of B. Modulo `B-1`, B equals one, so every power of B also equals one. The complete numeral is therefore congruent to the sum `S` of its digit values.

Compute `S` and the maximum digit value `m`, ignoring an optional sign. A legal base must be at least `m+1` and at least two. Test bases upward from `max(2,m+1)` through 62; the first satisfying `S%(B-1)==0` is the minimum answer.

No full integer conversion is needed, so arbitrarily long numeral text cannot overflow. Negating a value does not change whether it is divisible.

Modulo B−1, a base-B number equals its digit sum; try bases from the smallest that can represent its largest digit.
