# Meet in the middle while preserving equal-sum multiplicities

## Problem and constraints

Count nonempty subsets of up to 40 integers whose sum equals target `T`. Values and target may be negative or zero. Different element selections count separately even when they produce equal sums, and sums and counts require 64 bits. Cases continue to EOF.

## Building the approach

Split the array into halves of at most 20 elements and enumerate every subset sum of each half, including the empty sum zero. Sort both lists without deduplicating them.

Use one pointer at the smallest left sum and one at the largest right sum. Move left up when the total is too small and right down when too large. On equality, count consecutive copies of both values and add their product, then skip both groups. If the target is zero, subtract the single pairing in which both halves are empty.

## Walkthrough

For values `-1,1` and target zero, two half-pairs sum to zero: both empty, and both values selected. Removing the empty pair leaves one. If a left sum has three generating subsets and its complement has two, they form six distinct full subsets.

## Why it works

Subset generation preserves one list entry per element choice, including repeated sums. Every full subset decomposes uniquely into one left and one right choice. Sorted pointer moves discard only values that cannot meet the target with any remaining opposite value; equality grouping counts the Cartesian product of all matching choices. The only invalid generated full subset is both halves empty, counted exactly when target is zero.

## Complexity

With half size `H=ceil(N/2)`, generation and scanning cost `O(2^H)`, sorting `O(H*2^H)`, and storage `O(2^H)`.

## Common mistakes

- Deduplicating subset-sum lists.
- Adding one rather than multiplying matching multiplicities.
- Keeping the empty subset when the target is zero.
- Pruning on an exceeded target despite negative later values.
- Using 32-bit sums or counts.
