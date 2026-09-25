Let `possible[s]` mean that processed bars contain a subset summing to `s`. Initially only `possible[0]` is true. For a bar of length `w`, update sums from the target downward: `possible[s] |= possible[s-w]`.

Descending order ensures the source state has not used the current bar, enforcing the zero-one choice. Oversized positive bars can be ignored after being read, but all case input must still be consumed.

A bar longer than the target must still be read but may be skipped during updates.
