The half-base is built with integer multiplication by ten, avoiding unnecessary floating-point exponentiation. Integer division and remainder produce fixed-width half values numerically; leading zeros are restored only during output.

`setw(digits)` is applied for each matching value because width affects only the next output operation, while `setfill('0')` supplies the padding. Roots are visited once in increasing order. The outer EOF loop preserves query order and intentionally prints repeated query results without extra blank lines.
