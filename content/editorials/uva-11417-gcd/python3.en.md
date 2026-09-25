The shared upper bound is small, so precompute all answers. When extending the set from `1..j-1` to `1..j`, every old pair remains and the only new pairs are `(1,j)` through `(j-1,j)`. Therefore

`total[j] = total[j-1] + sum_{i=1}^{j-1} gcd(i,j)`.

Compute each gcd with Euclid's algorithm through `std::gcd`. Once the table through 500 exists, every query is a direct lookup independent of query order.

Precompute through the stated maximum N=500, then answer each query by lookup.
