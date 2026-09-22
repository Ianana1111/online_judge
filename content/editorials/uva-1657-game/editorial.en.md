# Alternate singleton elimination to simulate shared knowledge

## Problem and constraints

Distinct integers `1<=X<Y<=N` are chosen. One player knows their sum and speaks first; the other knows their product. After exactly M consecutive statements of ignorance, the next player can determine the pair. Print every pair for which this dialogue occurs. `N<=200`, `M<=100`.

## Building the approach

Begin with every unordered distinct pair alive. On even turns group alive pairs by sum, on odd turns by product. A value class of size one means the current player can know; collect those pairs as this turn's answers. Hearing `I don't know` eliminates all of them simultaneously before the next turn.

Precompute turns 0 through 100 per N and cache them. If two consecutive sum/product turns remove nothing, the alive set remains unchanged under both partitions and every later answer is empty.

## Walkthrough

For N=2, only `(1,2)` exists, so the sum player knows at M=0 and no later dialogue is possible. For N=10,M=4, alternating elimination leaves this knowing round's pairs `(2,5),(3,6),(3,10)`.

## Why it works

Inductively, alive pairs are exactly those consistent with all prior ignorance statements. The player's observed sum or product restricts them to one current group, and they know exactly when that group is singleton. Recording singletons therefore gives precisely this turn's successful cases; deleting all only after grouping models the public ignorance statement and yields the next shared-knowledge set. Induction proves `answers[M]`.

## Complexity

With `P=N(N-1)/2`, up to 101 rounds take `O(MP)` time and `O(P)` cached pair storage per N.

## Common mistakes

- Printing every survivor after M ignorance statements.
- Letting the product player speak first.
- Reusing the original universe each round.
- Including equal pairs.
- Deleting while still counting the same round.
