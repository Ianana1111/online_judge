Read all queries and preprocess only through their maximum. For every possible divisor `d`, increment the count of each multiple `d,2d,...`. After the sieve, `divisors[x]` is exact.

Scan `x` from small to large while maintaining `record`. Replace it whenever `divisors[x] >= divisors[record]`. Strict improvement obviously wins, and equality must replace because current `x` is larger. Store `record` in `best[x]`; each query becomes a lookup.

The divisor sieve increments each number once per divisor. Build a prefix-best answer up to the largest query. Because ties prefer the larger number, update the record when the divisor count is equal as well.
