# Use subset DP to fill four equal sides one after another

## Problem and constraints

Given four through twenty positive-length sticks, determine whether all of them can be used, without cutting, to form a square. This is equivalent to partitioning the sticks into four groups with equal sums. Print lowercase `yes` or `no`. Divisibility of the total and a sufficiently short longest stick are necessary, but they do not prove that the partition exists.

## Building the approach

Let `side=total/4`. Build one side at a time. A bitmask records which sticks have been used, and `remainder[mask]` records the length already placed on the current unfinished side. Unreachable masks contain `-1`; the empty set is reachable with remainder zero.

From a reachable mask, try every unused stick whose length does not make the current side exceed `side`. The next remainder is `(current+stick)%side`: reaching exactly `side` resets it to zero and begins a new side.

We do not need to store multiple remainders for one mask. The total length represented by a mask is fixed, so any valid ordering reaches the same remainder modulo `side`. This merges different placement orders without losing future possibilities.

## Walkthrough

Four sticks of length one form four sides immediately. For lengths `2,2,2,3,3,4`, the total is sixteen and no stick exceeds side four, yet each length-three stick needs a length one that does not exist. The subset transitions cannot finish four groups and correctly return `no`.

The capacity check must occur before taking a remainder. Otherwise a stick could illegally cross a corner and appear to fit after modulo reduction.

## Why it works

Every reachable state begins at the empty set and adds only unused sticks without exceeding the current side. It therefore represents some number of complete sides followed by one legal partial side.

Conversely, take any valid four-way partition and order the sticks within each side arbitrarily. Adding them in side order produces a sequence of allowed DP transitions ending at the full mask. Since the used total uniquely fixes the current remainder, merging routes to the same mask cannot remove a necessary continuation. The overall total equals four side lengths, so a reachable full mask with remainder zero uses every stick and completes exactly four sides.

## Complexity

There are `2^M` masks and each may try `M` sticks, giving `O(M*2^M)` time and `O(2^M)` space. With `M<=20`, the remainder table has at most about one million entries.

## Common mistakes

- Accepting as soon as the total is divisible by four.
- Using a greedy choice and discarding other valid groupings.
- Treating equal-length sticks as one object and losing multiplicity.
- Taking modulo before checking that a side was not exceeded.
- Allowing some sticks to remain unused.
