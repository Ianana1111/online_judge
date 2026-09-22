# Read the tournament ancestry and won bracket size from the bits of X

## Problem and constraints

There are `2^N` teams numbered from zero, with `1<=N<=30`, in a fixed knockout bracket. The smaller-numbered team always wins a match. Final rankings need only respect actual wins and their transitive implications. For team `X`, find its best and worst possible rank. Champion zero always has rank one in both cases.

## Building the approach

Direct every match edge from winner to loser. These comparisons form a rooted relation tree at team zero. For nonzero `X`, the opponent that eventually defeats it is obtained by clearing its lowest set bit. Repeating this operation walks through every ancestor known to be stronger. The number of such clear operations is the number of set bits in `X`, so the best rank is `popcount(X)+1`, including X itself.

Let the lowest set bit of `X` be `B=2^k`. Before losing, X wins the bracket block of size `B` beginning at X, so exactly `B-1` descendants are forced below it. Every other incomparable team may be placed ahead in a legal ranking. With `2^N` teams, the worst rank is therefore

`2^N-(B-1)`.

Handle `X=0` separately because it has no lowest set bit and is known to defeat the entire tournament.

## Walkthrough

For `N=4`, `X=10` is binary `1010`. Clearing set bits walks through ancestors 8 and 0, so the best rank is three. Its lowest set bit is two, giving one forced descendant, team 11; among sixteen teams its worst rank is 15.

For `X=15`, four set bits give best rank five. Its lowest set bit is one, so it has no forced descendants and may rank last.

## Why it works

Every nonchampion loses exactly once, and the fixed smaller-team winners make the match comparisons a rooted tree. The bracket boundary at which X loses clears precisely its lowest set bit; repeating reaches exactly all ancestors, so all and only `popcount(X)` teams are forced above it.

Trailing zero bits determine the size `B` of the sub-bracket X wins, containing X and exactly `B-1` transitive descendants. These descendants must rank below X; no other team is forced there. A topological ordering can place X immediately after its ancestors for the optimistic bound, or place every nondescendant first for the pessimistic bound. Both formulas are therefore attainable as well as necessary.

## Complexity

Fixed-width bit operations take `O(1)` time and space; viewed in terms of input bits, time is at most `O(N)`.

## Common mistakes

- Using `X+1` as the rank and imposing numeric order on incomparable teams.
- Counting only direct wins instead of all transitive descendants.
- Applying the lowest-set-bit formula to champion zero.
- Forgetting to include X itself in the best rank.
- Computing `2^N` through floating-point powers.
