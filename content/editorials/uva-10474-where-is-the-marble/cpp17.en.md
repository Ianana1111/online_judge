The outer loop reads both `n` and `q`, then continues unless both are zero. Sorting retains every duplicate, so iterator subtraction measures a position among all marbles.

The match condition checks `it != marbles.end()` before dereferencing. C++ short-circuit evaluation makes this safe for an empty array and for a target larger than every value.

A found index is increased by one for the problem's numbering. Each case prints one incrementing `CASE#` heading, followed immediately by all of that case's query results.
