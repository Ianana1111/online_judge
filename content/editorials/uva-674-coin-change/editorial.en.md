# Add denominations outside amounts to count unordered unlimited change

## Problem and constraints

Count unordered combinations making each queried amount with unlimited coins of 1, 5, 10, 25, and 50 cents. Amounts range from 0 through 7489 and continue to end of file. Zero has one combination, the empty selection. Output only the numeric count, unlike another related problem that requires an English sentence.

## Building the approach

Let `ways[s]` count combinations for sum `s` using denominations processed so far. Initialize `ways[0]=1` and all others zero. For each denomination `coin`, scan amounts upward from `coin` and perform

`ways[s] += ways[s-coin]`.

The existing value represents combinations using no new coin. Every combination at `s-coin` becomes one using at least one after appending a coin. The upward scan lets that smaller state already contain the current denomination, allowing unlimited copies. Keeping denominations in the outer loop introduces every multiset once and avoids counting different coin orders.

Precompute the whole legal range once so every input query becomes a table lookup.

## Walkthrough

Eleven cents has four combinations: eleven pennies; one nickel plus six pennies; two nickels plus one penny; or one dime plus one penny. Reversing the order of dime and penny is not a new combination. Four cents has only pennies, while zero retains the one empty combination used as the dynamic-programming base.

## Why it works

Induct on introduced denominations. Before any coin, only sum zero has the empty combination. When adding `coin`, each target combination uniquely either uses none, already counted in the old state, or uses at least one. Removing one current coin from the latter gives a unique combination for `s-coin` under the expanded denomination set, exactly counted by the upward update. The two groups are disjoint and complete, proving every unordered combination is counted once.

## Complexity

For `U=7489`, precomputation takes `O(5U)` time and `O(U)` space. Each query is `O(1)`.

## Common mistakes

- Putting amounts outside denominations and counting ordered sequences.
- Scanning amounts downward as if each denomination were single-use.
- Setting `ways[0]` to zero.
- Recomputing or corrupting the shared table per query.
- Printing the English sentence used by a different coin-change problem.
