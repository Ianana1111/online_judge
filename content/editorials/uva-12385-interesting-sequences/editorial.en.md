# Greedily take the earliest finishing equal-endpoint interval

## Problem and constraints

A contiguous interval of length at least two is interesting when its first and last values are equal. From a positive-integer sequence of length up to 100,000, maximize the number of pairwise nonconflicting interesting intervals. Two consecutive chosen intervals may share one endpoint, which is essential to the answer.

## Building the approach

Scan from the endpoint of the last chosen interval while recording values seen in the current search. The first repeated value creates the earliest possible finishing interesting interval, so choose it immediately. Clear the current seen set, but insert the current value again because this right endpoint may also start the next interval.

To avoid repeatedly clearing a 100,001-entry array, use epochs. `seen[v]==epoch` means `v` belongs to the current search. Choosing an interval increments the epoch, invalidating all old marks in constant time, and the current value is then marked in the new epoch.

## Walkthrough

For `1,2,1,3,1`, the third position closes the first chosen interval. Its value 1 is retained as the new start, and the fifth position closes a second interval. An all-7 sequence of length `N` permits every adjacent pair, so the answer is `N-1`, not about half.

## Why it works

From any current start boundary, the first repeated value occurs at an endpoint `r` no later than the first interval endpoint of any feasible solution. Replacing that solution's first interval by the greedy one cannot invalidate later intervals, because their starts were at or after the old, later endpoint. Therefore some optimum contains the greedy choice. Restarting from `r` preserves exactly the allowed shared endpoint, so repeating the exchange argument proves global optimality. Epoch marks behave exactly like clearing and reinserting `r`.

## Complexity

The scan performs constant work per element, for `O(N+V)` time including initialization of value range `V=100000`, and uses `O(V)` space.

## Common mistakes

- Forbidding intervals from sharing an endpoint.
- Clearing state without retaining the selected right endpoint.
- Keeping values from inside the previous chosen interval.
- Treating a single position as an interval.
- Physically clearing the entire value range after every selection.
