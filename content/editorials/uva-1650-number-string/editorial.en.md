# Count permutations by the relative rank of their final element

## Problem and constraints

A length-L string over I,D,? describes adjacent comparisons in a permutation of 1 through L+1. Count valid permutations modulo 1,000,000,007 for `L<=1000`, reading cases to EOF. Wildcard accepts either actual direction but must not double-count a permutation.

## Building the approach

Let `previous[r]` count length-k relative permutations whose last element has zero-based rank r. Append a new final element with rank j among k+1 values; old ranks at least j shift upward, preserving all earlier comparisons.

For I, old last rank must satisfy `r<j`, so `current[j]` is a prefix sum before j. For D, `r>=j`, so use the suffix from j. Wildcard accepts every predecessor. Prefix sums make each rank transition constant time. Start from one single-element permutation and sum all final ranks after the signature.

## Walkthrough

`II` has only 123. `ID` has 132 and 231. `?D` combines ID and DD for three total, while `??` accepts all six length-three permutations.

## Why it works

Inserting rank j into a predecessor and shifting old ranks defines one unique longer relative permutation; removing the last rank reverses it uniquely. Thus transitions neither omit nor duplicate. Old last rank below j is exactly an increasing final relation, while rank at least j shifts above it and is decreasing. Wildcard takes their union. Induction proves every state, and final-rank classes are disjoint and complete.

## Complexity

Each length-k round takes `O(k)`, for `O(L^2)` time and `O(L)` rolling space.

## Common mistakes

- Forgetting L comparisons imply L+1 elements.
- Including rank j in the increasing prefix.
- Starting decreasing suffix at j+1.
- Multiplying wildcard counts by two.
- Leaving modular subtraction negative.
