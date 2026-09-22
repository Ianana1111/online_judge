# Expand a collected interval while tracking the earliest time at each endpoint

## Problem and constraints

Up to 10,000 treasures lie at strictly increasing positions on a line and disappear at deadlines. Start freely at time zero, move at unit speed, and collect instantly. Every treasure must be reached strictly before its deadline; print the earliest completion time or `No solution`.

## Building the approach

Passing a treasure can only help, so collected indices always form a contiguous interval. The next first-time collection expands it by the adjacent left or right treasure. Let `L[l,r]` and `R[l,r]` be earliest times after collecting l through r and ending at its left or right endpoint.

Every single treasure is a possible zero-time start when its deadline is positive. To compute a new left state, arrive at l from either endpoint of `[l+1,r]`; compute the right state symmetrically from `[l,r-1]`. Keep only candidates strictly below the new treasure's deadline. Earlier arrival at the same interval endpoint dominates later arrival, so one value per state suffices and interval lengths can use rolling arrays.

## Walkthrough

At positions 1,10,19 with deadlines 10,1,28, start in the middle, reach left at time 9, then right at 27. If the last deadline becomes 27, equality is too late and no solution exists.

## Why it works

Any route can collect treasures on first passage, and waits or detours before expanding the collected interval cannot improve an upper-deadline problem. Thus some optimum consists only of adjacent interval expansions. By induction, the two transitions cover every possible endpoint of the previous interval, add exact travel distance, and retain precisely legal arrivals. Earlier same-endpoint states dominate all future continuations, so minima lose nothing. The minimum full-interval endpoint time is globally earliest.

## Complexity

There are `O(N^2)` interval states with constant transitions, using `O(N)` rolling storage. Inputs use 64 bits and candidate additions use widened `__int128` arithmetic.

## Common mistakes

- Allowing arrival exactly at a deadline.
- Starting only at the leftmost or rightmost treasure.
- Storing one time without endpoint location.
- Overwriting rolling states in the wrong scan order.
- Treating -1 as an ordinary minimum value.
