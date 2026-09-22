# Order jobs by an exact adjacent-swap comparison

## Problem and constraints

Each job takes `T` days and incurs fine `S` for every day it waits before starting. Only one job can be processed at a time. For up to 1,000 jobs, output an order minimizing total fine; among optimal orders, choose the lexicographically smallest sequence of original one-based job IDs.

## Building the approach

Compare two adjacent jobs A and B. If A runs first, B waits an extra `T_A` days and contributes `T_A*S_B`. If B runs first, A contributes `T_B*S_A`. All other jobs have identical waiting time in either local order.

Therefore A belongs before B exactly when `T_A*S_B < T_B*S_A`. This is equivalent to increasing `T/S`, but cross multiplication stays exact and avoids floating-point ties. When both products are equal, the two local orders have equal cost, so smaller original ID comes first to obtain the lexicographically smallest optimum.

Sort complete job records using this comparator, then output their saved IDs.

## Walkthrough

Let A take three days with fine four, and B take one day with fine three. A before B adds nine in waiting fine, while B before A adds four, so B must come first.

When two jobs have proportional time and fine, either order costs the same. Their original IDs then determine the required tie order.

## Why it works

If a schedule contains an adjacent pair opposite to the comparator, swapping that pair strictly reduces their waiting contribution and changes no other job's waiting duration. Repeatedly removing such inversions reaches the sorted order, so no schedule can be cheaper.

Only equal-ratio jobs can be swapped without changing cost. Sorting every such group by increasing ID picks the lexicographically smallest sequence among all minimum-cost schedules.

## Complexity

Sorting takes `O(N log N)` time and job storage uses `O(N)` space.

## Common mistakes

- Sorting only by descending fine or ascending processing time.
- Reversing the ratio comparison.
- Comparing floating-point ratios for equality.
- Ignoring the original-ID tie rule.
- Printing sorted positions rather than saved IDs.
