# Reverse the eliminations with the correct prime at each size

## Problem and constraints

There are 1 to 3,501 people in a circle, labeled 1 through n. Eliminate every second person in the first round, every third in the next, then use steps five, seven, eleven, and successive primes. Each new count starts at one on the person after the eliminated person. Find the survivor. Zero ends input.

## Building the approach

Deleting people from an array works conceptually but repeatedly shifts entries. We only need the final survivor, so undo the eliminations instead.

When one person remains, their local zero-based position is zero. Suppose an elimination with step p reduces a circle of size s to size s − 1. The next round starts at old position `p mod s`. A survivor at new position j therefore came from old position `(j + p) mod s`.

The delicate part is choosing p. This is not a fixed-step Josephus problem, and a smaller remaining circle does not restart the prime sequence at two. In the original n-person game, the round with s people occurs after n − s eliminations, so it uses zero-based prime `primes[n − s]`. Restore sizes from two up to n using that index, then add one to return to the original labels.

## Walkthrough

For n = 6, forward eliminations use 2, 3, 5, 7, and 11. Reversing from survivor zero: size 2 with step 11 gives 1; size 3 with 7 gives 2; size 4 with 5 gives 3; size 5 with 3 gives 1; size 6 with 2 gives 3. The one-based answer is 4. For n = 1, no restoration is needed and the answer is 1.

## Why it works

The eliminated zero-based position is `(p − 1) mod s`, so the next counting origin is `p mod s`. The modular shift maps each remaining local position back to its old position exactly. Applying these inverse mappings in reverse round order reconstructs the original survivor. The index n − s supplies precisely the prime used by each original round.

## Complexity

Precompute the first 3,500 primes once. Each query takes O(n) time and O(1) extra state beyond the shared prime table.

## Common mistakes

- Using one constant step for every round.
- Reading primes forward while restoring sizes upward.
- Adding p − 1 instead of p in the inverse mapping.
- Forgetting the final conversion to one-based labels.
- Trying to eliminate someone when n = 1.
