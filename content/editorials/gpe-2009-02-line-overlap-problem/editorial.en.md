# Sweep endpoints and count overlapping pairs

## Problem and constraints

Several segments lie on the same line. For every pair of segments, take the length of their intersection and sum these lengths. This is not union length: where three segments overlap, that region contributes once for each of the three pairs. There are fewer than 200,000 segments, integer endpoints are below 100,000, and a line containing `.` ends input. The final value may exceed 32-bit range.

## Building the approach

Enumerating all segment pairs is quadratic. Instead, fix a small interval between consecutive endpoints and ask how many segment pairs cover it. The active segment set cannot change inside such an interval.

Create a `+1` event at every left endpoint and a `-1` event at every right endpoint, then sort all events. Suppose `k` segments cover the interval of length `L` from the previous event to the current event. Any two of them contribute that full length, so the interval contributes `L * C(k,2) = L*k*(k-1)/2`.

Add this contribution before applying the current event, because the old active count describes the interval just crossed. Events at the same coordinate have zero distance between them, so their internal ordering cannot change the total.

## Walkthrough

For segments `[75,325]`, `[5,120]`, `[100,255]`, and `[325,500]`, the positive pairwise intersections have lengths 45, 155, and 20, totaling 220.

On `[100,120]`, three segments are active. There are three pairs, so this length-20 piece contributes 60. The first and last segments merely touch at 325; a point has length zero and contributes nothing.

## Why it works

All endpoints partition the line into disjoint elementary intervals. Within one interval, exactly the same `k` segments are present, and exactly `C(k,2)` unordered pairs have intersections containing the whole interval. The algorithm adds the interval length once for each such pair.

The intersection of any fixed pair is itself the union of the elementary intervals covered by both segments. Summing by elementary interval therefore counts precisely the same lengths as summing pair by pair, only in the opposite order. Since the intervals do not overlap in positive length, no contribution is lost or duplicated.

## Complexity

There are `2N` events. Sorting costs `O(N log N)`, the sweep costs `O(N)`, and event storage uses `O(N)` space.

## Common mistakes

- Adding an interval once whenever `k>0`, which computes union length.
- Using `k-1` rather than `k(k-1)/2` pairs.
- Counting a shared endpoint as length one.
- Updating `active` before charging the interval just crossed.
- Letting the intermediate product use 32-bit arithmetic.
