# Greedily choose each earliest finishing compatible meeting

## Problem and constraints

For each day, fewer than 20 candidate meetings occupy half-open integer intervals with `0<=start<finish<=10`. Choose the maximum number of nonoverlapping meetings; one may start exactly when another finishes. `0 0` ends each day's list, and an empty day has answer zero.

## Building the approach

Sort meetings by increasing finish time. Keep the finish of the last selected meeting, initially zero. Accept a meeting exactly when `start>=end`, increment the count, and replace `end` with its finish.

Finishing earliest leaves at least as much time for every later choice as any other compatible meeting. Starting earliest or having shortest duration does not provide that guarantee.

## Walkthrough

Intervals `[0,3),[3,4),[4,7)` can all be selected. The non-strict compatibility check is essential: `[0,5)` and `[5,10)` do not overlap. Many identical `[1,2)` intervals still allow only one.

## Why it works

Let an optimal nonempty schedule begin with meeting `o`, and let `g` be the globally earliest-finishing available meeting. Since `g` finishes no later than `o`, replacing `o` by `g` cannot block any later meeting and preserves the count. Thus some optimum starts with the greedy choice. Applying the same exchange argument after its finish proves every subsequent choice and therefore the maximum count.

## Complexity

For `K` meetings, sorting takes `O(K log K)`, scanning takes `O(K)`, and storage is `O(K)`.

## Common mistakes

- Sorting by start time or duration.
- Requiring a positive gap between meetings.
- Treating `0 0` as a real interval.
- Initializing the available time after zero.
