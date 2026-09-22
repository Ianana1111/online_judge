The DP sentinel `limit+1` only needs to distinguish unusable amounts. Every denomination is considered before checking an amount for a gap, and `limit*stamps.back()` is the true maximum possible with S stamps.

`bestCoverage=-1` accepts the first set. Equal coverage compares vector size, then `lexicographical_compare` over reverse iterators. `setw(4)` applies to coverage and each denomination receives its own `setw(3)`, producing the platform's explicit layout.
