# Cancel common values with XOR to find each deletion

## Problem and constraints

There are `M` unordered integer lists. The first has `N` elements, the next has `N-1`, and each later list is made by deleting exactly one value from the previous list and rearranging it. Print the missing value between every adjacent pair, producing `M-1` lines. The bounds include `M<N`, `M*N <= 5,000,000`, and values below 65,536. Values need not be distinct.

## Building the approach

Sorting adjacent lists would work but spends effort arranging all values merely to cancel common entries. XOR already has the needed cancellation properties: `x^x=0`, `x^0=x`, and order does not matter.

If value `d` is deleted, every other occurrence appears equally often in the two adjacent lists. XORing both complete lists pairs and cancels those occurrences, leaving only `d`. Therefore compute one XOR total per list. After reading the current list, `previous ^ current` is the deleted value; then make the current total the previous total for the next round.

The first list only establishes the initial total and produces no output. Values can be XORed as they are read, so no list storage is required.

## Walkthrough

Suppose the first list is `13766 1891 5370 24317 30676` and the second is `13766 5370 30676 24317`. The four common values cancel across the two totals and the result is 1891.

If the third list then removes 30676, the next comparison must be between the second and third lists, giving 30676. Even if a value appears multiple times, equal occurrences still cancel in pairs and the one deleted occurrence remains.

## Why it works

For adjacent lists `A` and `B`, the input guarantee says that their multisets differ by exactly one occurrence `d`. Pair every occurrence retained in `B` with its identical occurrence in `A`. Each pair XORs to zero. Associativity and commutativity allow these pairs to cancel regardless of input order, leaving `d` as the XOR of both list totals.

At the end of each iteration the program saves the just-read total. Starting with the second list, `previous` and `current` therefore always correspond to adjacent inputs, so every emitted deletion is correct and exactly `M-1` values are printed.

## Complexity

Every input value is read and XORed once. Time is linear in the input size, bounded by `O(MN)`, and extra space is `O(1)`.

## Common mistakes

- Converting lists to sets and losing multiplicities.
- Comparing every later list with the first one instead of updating `previous`.
- Reading `N` values for every row rather than decreasing the length each time.
- Depending on physical input lines instead of the known element counts.
- Applying the technique when more than one element may disappear at a step.
