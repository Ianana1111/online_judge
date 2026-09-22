# Let inversion parity determine the game winner

## Problem and constraints

The input is a permutation of `1..N`. A move swaps one adjacent inverted pair, Marcelo moves first, and a player unable to move loses. This platform requires both the winner and the total number of moves. `N` reaches 100,000, and zero ends input.

## Building the approach

An inversion is a pair `i<j` with `a[i]>a[j]`. Swapping one adjacent inverted pair removes exactly that inversion and does not change the total inversion relation with any third element. Therefore every move decreases the inversion count by exactly one. The game ends only at sorted order with zero inversions, so its length is fixed at the initial inversion count regardless of choices.

An odd count lets Marcelo make the final move; an even count lets Carlos win. Count inversions with a Fenwick tree from left to right. Before value `x`, `i-query(x)` previous elements are greater than `x`, giving the new inversions whose right endpoint is current. Use 64 bits for the total.

## Walkthrough

Permutation `3,1,2` has inversions `(3,1)` and `(3,2)`, so it takes two moves and outputs `Carlos 2`. Permutation `2,1` has one move and outputs `Marcelo 1`. An already sorted permutation has zero moves, so Marcelo cannot act and Carlos wins.

## Why it works

When adjacent `a>b` are swapped, only their mutual order changes. Their positions relative to every other element remain on the same side as a pair, so their combined inversion contribution with that element is unchanged. Exactly inversion `(a,b)` disappears. Every nonsorted permutation has an adjacent inversion, so moves continue until the inversion count reaches zero after exactly its initial number of steps. The Fenwick query counts each inversion once when its right endpoint arrives, so its total and parity correctly determine both output fields.

## Complexity

Each element performs one Fenwick query and update, for `O(N log N)` time and `O(N)` space. The maximum total requires `long long`.

## Common mistakes

- Counting only currently adjacent inversions.
- Believing different legal swap choices change the number of moves.
- Storing up to roughly five billion inversions in `int`.
- Reversing the winner parity.
- Printing only the winner and omitting this platform's move count.
