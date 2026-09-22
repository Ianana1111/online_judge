# Track every signed sum attainable with an exact element count

## Problem and constraints

Partition `N+M` integers into groups of exactly `N` and `M` elements. Print the maximum and then minimum product of the two group sums. Both sizes are from one through fifty, values range from -50 to 50, and negative values, zeroes, and duplicate input elements are all distinct selectable items.

## Building the approach

Let total input sum be `T` and one selected group sum be `s`. The other sum is `T-s`, so the objective is `s(T-s)`. Because swapping groups changes neither product, choose exactly `k=min(N,M)` elements for the DP.

`possible[count]` is a bitset of signed sums attainable with exactly `count` selected elements. Offset sums by 2500, since at most fifty selected values of magnitude fifty give range `[-2500,2500]`. Initialize only count zero, sum zero.

For each value, update counts downward. Selecting a positive value shifts the previous-count bitset left; selecting a negative one shifts it right. OR this into the existing state, which represents not selecting the value. Descending count prevents the same element from being used twice.

Finally scan every set bit in `possible[k]`, compute `s(T-s)` in 64 bits, and update both extrema.

## Walkthrough

For group sizes two and values `1,2,3,4`, total is ten. Selecting `1,4` gives `s=5` and product 25, the maximum. Selecting `1,2` gives `s=3` and product 21, the minimum.

With negative values, products may also be negative, so extrema cannot safely start at zero and the scan must include negative sums.

## Why it works

Initially, selecting zero elements yields only sum zero. For each new value, every valid choice with `count` elements either omits it and remains in the current bitset, or selects it and comes from a prior state with `count-1` elements and shifted sum. Descending updates ensure those sources exclude the current item. Induction proves the bitsets represent exactly all legal exact-cardinality selections.

Every complete partition corresponds to one feasible selected sum `s`, and its complement has sum `T-s`. Conversely, every feasible exact-`k` selection defines a valid partition. Evaluating all such sums therefore finds both true product extremes.

## Complexity

For bitset width `B=5001` and machine word size `w`, time is `O((N+M)k ceil(B/w)+B)` and space is `O(k ceil(B/w))` machine words.

## Common mistakes

- Updating counts upward and reusing the current item.
- Tracking sums without enforcing the exact group size.
- Finding only a sum near `T/2` and omitting the minimum product.
- Shifting negative values in the wrong direction or ignoring negative sums.
- Initializing extrema to zero.
