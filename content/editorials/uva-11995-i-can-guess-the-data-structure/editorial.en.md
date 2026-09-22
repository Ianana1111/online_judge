# Replay every operation against all three candidate structures

## Problem and constraints

Given insert and extract records with observed extracted values, determine whether the hidden structure could be a stack, queue, max-priority queue, none, or several. Cases contain up to 1,000 operations and continue until EOF. When multiple candidates fit, output `not sure`.

## Building the approach

Maintain one instance of each candidate and a Boolean feasibility flag. Insert every value into all three. On extraction, for each candidate check that it is nonempty and its next value equals the record; otherwise permanently clear its flag. Pop safely from nonempty containers so later operations can still be consumed.

After replay, count true flags. Zero gives `impossible`, one gives the exact structure name, and more than one gives `not sure`. Duplicates must remain as separate entries, especially in the heap.

## Walkthrough

Insert 2,3,1 and then extract 3: only a max-priority queue matches; stack expects 1 and queue expects 2. Insert 1,2 then extract 2: both stack and priority queue fit, so answer is `not sure`. Extracting from an initially empty structure eliminates all three.

## Why it works

For each candidate, the simulated contents match exactly what that structure would contain after every processed operation. The first empty or value mismatch proves the candidate cannot generate the trace. If no mismatch occurs, the replay itself is a constructive demonstration that it can. Thus flags represent precisely the feasible candidates, and classification by their count is correct.

## Complexity

Stack and queue operations are `O(1)` and heap operations `O(log N)`, giving `O(N log N)` time and `O(N)` total storage.

## Common mistakes

- Using a min-priority queue.
- Selecting the first matching structure without checking ambiguity.
- Calling top or pop on an empty container.
- Reactivating a candidate after an earlier contradiction.
- Reusing containers across cases.
