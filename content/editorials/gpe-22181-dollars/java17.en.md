All values are multiples of five cents, so scale one unit to five cents. The maximum target becomes 6000 and denominations become `1,2,4,10,20,40,100,200,400,1000,2000`.

Let `ways[s]` count combinations for sum `s` using denominations processed so far. Set `ways[0]=1` for the empty combination. Process coin types in a fixed outer order. For each coin, scan sums upward and add `ways[s-coin]` into `ways[s]`. Upward scanning allows another copy of the current denomination, while the fixed outer order prevents different selection orders from being counted separately.

Precompute once, then answer every query by lookup. Parse amounts as decimal strings rather than binary floating point, avoiding a rounding error before scaling.

Use five cents as one unit, leaving at most 6,000 units. Process denominations in fixed order so each unordered combination is counted once, then print the original amount and way count in right-aligned fields of width six and seventeen.
