# Count decimal digits by positional cycles and remove leading zeroes

## Problem and constraints

Count occurrences of digits 0 through 9 in ordinary decimal representations of every positive integer in the inclusive interval between `a` and `b`. Endpoints are positive below `10^8` and may be reversed; `0 0` terminates input. Leading zeroes do not exist.

## Building the approach

Define `prefix(n)` for numbers 1 through n, then subtract `prefix(min-1)` from `prefix(max)`. For place value `factor`, split n into `higher`, current `digit`, and `lower`.

For nonzero d, complete higher cycles contribute `higher*factor`; the partial cycle contributes zero, `lower+1`, or `factor` according as current digit is below, equal to, or above d. For zero, the first apparent cycle represents missing leading positions and must be removed: only when `higher>0`, add `(higher-1)*factor` plus `lower+1` if current digit is zero, otherwise `factor`.

## Walkthrough

From 1 through 10, zero occurs once, one twice, and digits two through nine once. Applying the ordinary formula to zero would wrongly count spellings such as 01. Reversed endpoints 10 and 1 must produce the same result as 1 and 10.

## Why it works

At a fixed place, each digit occupies blocks of `factor` numbers in cycles of length `10*factor`. Complete cycles and the partial suffix yield exactly the stated contributions. For zero, subtracting the first high cycle removes precisely numbers too short to possess that place. Summing independent positions counts every written occurrence once, and prefix subtraction leaves exactly the requested closed interval.

## Complexity

Each prefix handles `O(log n)` positions and ten fixed digits, using `O(1)` extra space and 64-bit counters.

## Common mistakes

- Applying the nonzero formula to zero and counting leading zeroes.
- Subtracting `prefix(a)` instead of `prefix(a-1)`.
- Assuming endpoints are ordered.
- Adding only `lower` when current digit equals the target.
- Processing the `0 0` sentinel as a number.
