# Preserve ascending and descending possibilities across every adjacent pair

## Problem and constraints

Each case contains exactly ten distinct beard lengths. Determine whether the original order is strictly increasing or strictly decreasing. Do not sort the input. Output one `Lumberjacks:` header before all cases, then `Ordered` or `Unordered` per case.

## Building the approach

Initialize two flags, `increasing` and `decreasing`, to true. For every adjacent pair, invalidate increasing if the next value is not greater, and invalidate decreasing if it is not smaller. After all comparisons, the sequence is ordered when either flag survives.

First and last values alone are insufficient, and the first pair cannot guarantee the direction of every later pair. One local reversal breaks global monotonicity.

## Walkthrough

`1,2,...,10` preserves increasing and `10,9,...,1` preserves decreasing, so both are ordered. Swapping 5 and 6 inside the increasing list leaves endpoints 1 and 10 but creates a local descent among ascents, invalidating both directions.

## Why it works

A sequence is strictly increasing exactly when every adjacent pair increases, and strictly decreasing exactly when every pair decreases. Each flag remains true precisely while all processed pairs satisfy its property and never incorrectly recovers after a violation. Their final logical OR therefore matches the allowed two directions.

## Complexity

Each case performs nine comparisons and uses `O(1)` time and extra space.

## Common mistakes

- Accepting only ascending order.
- Looking only at endpoints.
- Sorting before checking and destroying the original order.
- Requiring both directions simultaneously.
- Printing the global header once per case or omitting it.
