# Advance male and female bee counts from the same old year

## Problem and constraints

Despite the legacy slug, this is the Bee population problem. Initially there is one immortal female and no males. Each year females produce a male; males produce one male and one female; ordinary old bees then die while the immortal female remains. Given year `N`, print male count and total bee count. Zero is valid and `-1` terminates input. Results are at most `2^32`.

## Building the approach

Let `male` and `female` describe one completed year, with the immortal queen included in female. Every current bee produces a next-generation male, so

`nextMale=male+female`.

Only current males produce new ordinary females, and the queen remains, so

`nextFemale=male+1`.

Compute both next values from the unchanged old state before assigning them. Begin with `(0,1)` and repeat N times. The second output is `male+female`, not the female count alone.

## Walkthrough

At year zero, output is `0 1`. After one transition there is one male and one female, total two. Year two has two of each, total four. Year three has four males and three females, total seven.

These values also show why ordinary old males are not simply accumulated forever.

## Why it works

The initial state exactly represents the single immortal female. Assuming current counts are correct, every existing bee contributes one next male, giving their total. Every old male contributes one next female and the immortal queen contributes the additional one. Ordinary old bees add nothing else.

The two formulas therefore partition and count every surviving next-year bee exactly. Induction over N transitions proves the final male, female, and total counts.

## Complexity

Each query takes `O(N)` time and `O(1)` space. `unsigned long long` safely covers the stated nonnegative result range.

## Common mistakes

- Updating male first and using that new value for female in the same year.
- Forgetting the immortal queen's extra one.
- Retaining ordinary old bees.
- Printing female rather than total in the second field.
- Treating year zero as the sentinel.
