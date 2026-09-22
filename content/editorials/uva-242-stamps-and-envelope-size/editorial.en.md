# Measure gap-free coverage and apply reverse-denomination tie rules

## Problem and constraints

An envelope holds at most S stamps, and each candidate set contains ascending denominations with unlimited copies. Find its largest gap-free coverage from one and choose the best set by larger coverage, then fewer denominations, then lexicographically smaller denominations compared from largest downward. This platform prints coverage width four and denomination width three.

## Building the approach

For one set, let `dp[x]` be the minimum stamps needed for x, with `dp[0]=0`. For each amount increasing through `S*largest`, try every denomination d as `dp[x-d]+1`. Increasing amounts allow unlimited reuse. The first amount needing more than S stamps ends coverage at x-1.

Compare completed candidates in the exact priority order. When coverage and count tie, use reverse iterators so the largest denomination is compared first, then the next largest.

## Walkthrough

With S=5 and denominations 1,3, amounts through 13 are covered, 14 needs six stamps, and reachable 15 does not repair the gap. With S=4, sets `1,2,3,7` and `1,2,5,6` both cover 24; the latter wins because maximum denomination six is smaller.

## Why it works

Any representation of x ends with some d and leaves a representation of x-d; conversely each such predecessor plus d is valid, proving the minimum-stamp recurrence. Increasing order makes all sources available even for repeated denominations. The first state above S is exactly the earliest gap. Applying comparison criteria only after higher-priority ties exactly implements the required selection.

## Complexity

For K denominations and largest D, one candidate costs `O(SDK)` time and `O(SD)` space.

## Common mistakes

- Returning the greatest reachable value rather than first-gap coverage.
- Using each denomination only once.
- Comparing denominations before denomination count.
- Comparing smallest denominations first.
- Ignoring fixed output widths.
