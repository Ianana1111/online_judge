# Precompute the first and therefore smallest generator for every target

## Problem and constraints

An integer `N` generates `M` when `M=N+digitSum(N)`. For each target from 1 through 100,000, print its smallest positive generator or zero if none exists. Multiple generators may reach the same target.

## Building the approach

Because digit sum is nonnegative, a generator never exceeds its target. Precompute by enumerating every candidate value from 1 through 100,000, calculating its generated target, and writing the candidate only if that target is in range and has no recorded answer.

Ascending enumeration makes the first writer the smallest generator. Later larger candidates must not overwrite it. Zero initialization naturally represents both not-yet-written and final no-solution entries because real candidates are positive.

## Walkthrough

`245+2+4+5=256`, so 245 generates 256. Target 216 has generators 198 and 207; ascending construction records 198 first and preserves it. Target one has no positive generator and remains zero.

## Why it works

Every valid generator lies inside the enumerated range and is written only to the target it truly generates. For any target with candidates, the first encountered candidate is its minimum and is never replaced. A target left untouched therefore has no generator in its complete possible range. The table contains exactly the required answers.

## Complexity

For bound `U=100000`, preprocessing takes `O(U log U)` digit operations and `O(U)` space; each query is `O(1)`.

## Common mistakes

- Overwriting the first generator with a later larger one.
- Summing the target's digits instead of the candidate's.
- Indexing generated values beyond the table.
- Omitting a digit during extraction.
- Printing -1 rather than zero for no solution.
