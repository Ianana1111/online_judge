Moving from `(n-1)!` to `n!` changes the number of factors of five only when `n` is divisible by five. Therefore `f` is constant within each block identified by `floor(n/5)` and strictly increases between consecutive blocks. Multiples of 25 may skip several numeric values, but still begin only one new attained plateau.

The interval touches every block number from `floor(low/5)` through `floor(high/5)`, so the answer is `high/5-low/5+1`.

`// 5` gives each endpoint’s block index; the inclusive block count adds one.
