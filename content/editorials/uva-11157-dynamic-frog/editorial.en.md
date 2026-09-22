# Duplicate reusable stones and alternate two paths

## Problem and constraints

A frog travels from position 0 to distance `D` and then returns. A small stone may be used only once in the entire round trip, while a big stone may be used repeatedly. Up to 100 distinct stones are already sorted, and `D` can be as large as `10^9`. We must minimize the largest single jump used by a valid round trip.

## Building the approach

Reverse the return trip mentally. We now need two left-to-right paths. A small stone can belong to only one path, while a big stone can be used by both.

Represent that capacity directly in a sorted list: insert each small stone once, each big stone twice, and each riverbank twice. Give even-indexed entries to one path and odd-indexed entries to the other. Consecutive stops on either path are two indices apart in the combined list, so the largest jump is the maximum of `points[i] - points[i-2]`.

Duplicating both banks matters because both paths must begin and end there. It also makes the same formula handle an empty river or a single small stone without special cases.

## Walkthrough

Let `D = 10` with only `S-5`. The list is `0, 0, 5, 10, 10`; the two-index gaps are 5, 10, and 5, so one direction must jump the full distance 10.

If the stone is `B-5`, position 5 appears twice. Each path can stop there, and the largest jump falls to 5. With no stones, the duplicated banks make the formula return `D`.

## Why it works

The alternating assignment is feasible: each single-copy small stone belongs to exactly one path, while the two copies of every big stone allow both paths to use it. Its maximum jump is precisely the largest two-index gap.

For any three consecutive entries in the combined list, the two paths cannot both use the single middle occurrence. At least one path must cross from the first entry to the third, requiring that two-index distance. Duplicated big stones do not introduce a stronger missing-stop constraint because each path can take one copy. Therefore every measured gap is a necessary lower bound, and the alternating construction reaches all of them simultaneously. Its maximum is optimal.

## Complexity

Each stone contributes at most two entries. The time and extra space are both `O(N)`; no sorting is needed because the input is already ordered.

## Common mistakes

- Optimizing only the outbound trip and reusing small stones on the return.
- Looking only at adjacent gaps instead of the gaps after splitting two paths.
- Duplicating small stones as if they were reusable.
- Inserting each bank only once and losing one path's endpoint jump.
