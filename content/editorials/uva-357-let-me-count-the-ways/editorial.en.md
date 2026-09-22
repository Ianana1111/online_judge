# Add coin denominations one at a time to count unordered change

## Problem and constraints

Using unlimited coins of 1, 5, 10, 25, and 50 cents, count the distinct combinations that make each queried amount from 0 through 30000. Rearrangements of the same coins are one combination. Queries continue to end of file, and zero has one combination: choosing no coins. The output sentence is singular only when the count is exactly one.

## Building the approach

Choosing a next coin recursively can accidentally count different orders of the same collection. Instead, introduce denominations in a fixed order. Let `ways[s]` be the number of combinations making `s` with the denominations processed so far. Start with `ways[0] = 1` and all other entries zero.

For a new denomination `coin`, scan `s` upward from `coin` and perform

`ways[s] += ways[s - coin]`.

The old value counts combinations that do not use the new denomination. Each combination counted at `s - coin` becomes one using at least one new coin after another copy is attached. The upward scan allows `ways[s - coin]` to already contain this denomination, which provides unlimited copies. Keeping the coin loop outside ensures that a collection is introduced only once, independent of order.

## Walkthrough

Eleven cents has four combinations: eleven pennies; one nickel and six pennies; two nickels and one penny; or one dime and one penny. Dime-then-penny is not separate from penny-then-dime. Four cents has only the all-penny combination. Zero cents retains the initial empty combination, which is also the base from which the first real combinations are built.

## Why it works

Induct on the processed denominations. With none, only the empty combination for zero exists. When adding `coin`, every target combination belongs to exactly one of two disjoint groups: it uses no `coin`, or it uses at least one. The first group is the previous `ways[s]`. Removing one `coin` from a combination in the second group gives a unique combination for `s - coin` using the now-available denominations, and the upward update counts exactly those. Thus every unordered combination is counted once after all five denominations.

## Complexity

Precomputation to `U = 30000` takes `O(5U)` time and `O(U)` space. Each query is answered in `O(1)`. Counts exceed 32-bit range, so 64-bit storage is required.

## Common mistakes

- Putting amounts outside coins and counting ordered sequences.
- Scanning amounts downward as if each denomination could be used once.
- Initializing `ways[0]` to zero.
- Rebuilding or partially overwriting the table for each query.
- Using 32-bit counts or selecting the sentence form from the amount rather than the count.
