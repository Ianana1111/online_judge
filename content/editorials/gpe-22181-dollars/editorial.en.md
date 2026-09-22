# Count unordered change combinations in five-cent units

## Problem and constraints

Using eleven New Zealand denominations from five cents through one hundred dollars, count unordered combinations for each amount up to 300 dollars. Every denomination may be used without limit. Coin order does not create a new combination. Zero ends input. Output the amount with two decimals in width six and the count right-aligned in width seventeen.

## Building the approach

All values are multiples of five cents, so scale one unit to five cents. The maximum target becomes 6000 and denominations become `1,2,4,10,20,40,100,200,400,1000,2000`.

Let `ways[s]` count combinations for sum `s` using denominations processed so far. Set `ways[0]=1` for the empty combination. Process coin types in a fixed outer order. For each coin, scan sums upward and add `ways[s-coin]` into `ways[s]`. Upward scanning allows another copy of the current denomination, while the fixed outer order prevents different selection orders from being counted separately.

Precompute once, then answer every query by lookup. Parse amounts as decimal strings rather than binary floating point, avoiding a rounding error before scaling.

## Walkthrough

Twenty cents can be made as one 20-cent coin, two 10-cent coins, one 10 plus two 5s, or four 5s: four combinations. Reordering the same coins is not another answer.

Five cents has exactly one combination. The 300-dollar query must still include the large 50- and 100-dollar denominations.

## Why it works

Induct over processed denominations. A combination for sum `s` either uses no current coin and is already counted, or uses at least one. Removing one current coin uniquely maps the second class to a combination for `s-coin` using denominations up through the current one. These classes are disjoint and complete.

The upward update makes the source include any number of current coins. Because each combination is introduced according to its greatest processed denomination rather than an ordering of individual coins, it is counted exactly once.

## Complexity

Precomputation takes `O(11*6000)` time and `O(6000)` space. Each query is `O(1)` after parsing.

## Common mistakes

- Putting amounts outside coins and counting permutations.
- Scanning sums downward and allowing each denomination only once.
- Omitting large paper denominations.
- Scaling a floating-point amount by 100 and truncating.
- Using 32-bit counts or ignoring output widths.
