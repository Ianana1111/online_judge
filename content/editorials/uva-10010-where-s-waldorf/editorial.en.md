# Search starts in row-major order across eight directions

## Problem and constraints

In an alphabetic grid of at most 50 by 50, locate the starting coordinate of every query word. A word appears contiguously in a straight horizontal, vertical, or diagonal line in any of eight directions. Matching is case-insensitive. When several starts work, choose the smallest row and then the smallest column. Coordinates are one-based, and outputs for test cases are separated by a blank line.

## Building the approach

Normalize the grid and query to lowercase. Enumerate candidate starts in row-major order: rows outside, columns inside. For each start, try all direction pairs `(dr,dc)` with components in `{-1,0,1}` except `(0,0)`.

The `k`-th word character must match grid position `(r+k*dr,c+k*dc)`. Reject a direction immediately on an out-of-range coordinate or unequal character. Stop the entire search for this query after the first complete match.

Because starts are tested in the exact required order, the first success automatically satisfies the tie rule; direction order within one start cannot affect its coordinate.

## Walkthrough

For rows `zzA` and `Azz`, query `a` occurs at `(1,3)` and `(2,1)`. The first is correct because row has priority over column.

If `A`, `b`, and `C` appear down a main diagonal, query `abc` matches direction `(1,1)`. A four-direction search would miss it.

## Why it works

Every occurrence is uniquely described by a start and one of the eight directions. The algorithm enumerates all such pairs, and its coordinate formula visits exactly the consecutive cells of that line. A successful comparison is therefore equivalent to a real occurrence.

Candidate starts are ordered by increasing row and then column. When the first successful start is found, every higher-priority coordinate has already failed all directions, proving the output coordinate is the required one.

## Complexity

For an `R*C` grid and word length `L`, one query takes `O(RCL)` time with eight absorbed as a constant. Storage is `O(RC+L)`.

## Common mistakes

- Scanning columns before rows and prioritizing left over top.
- Checking only four directions.
- Comparing case-sensitively or printing zero-based coordinates.
- Continuing after success and overwriting the earliest start.
