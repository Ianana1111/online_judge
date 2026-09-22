# Encode each sorting priority in a strict comparator

## Problem and constraints

For each dataset, sort up to 10,000 signed 32-bit integers using three priorities. First, smaller remainders modulo positive `M` come first. Within one remainder, odd numbers precede even numbers. Odd ties are ordered descending, while even ties are ordered ascending. Remainders follow C semantics, so `-100 % 3` is `-1`. The terminating `0 0` line must also be printed.

## Building the approach

Translate the priority list directly into a comparator. Compute the signed remainders first; if they differ, compare them ascending. Only when they match, determine parity. If one value is odd and the other even, put the odd value first. Finally compare two odd values descending or two even values ascending.

Test oddness with `value % 2 != 0`, because a negative odd number has remainder `-1` in C++, not 1. Every return must be a strict comparison. Equal values should compare false rather than using `<=` or `>=`, which would violate the ordering contract required by `sort`.

Print each `N M` header before checking the sentinel, while checking the sentinel before any modulo operation so division by zero never occurs.

## Walkthrough

With `M=3`, the values `3,6,9,12,15` all have remainder zero. Their odd values come first in descending order, `15,9,3`, followed by their even values ascending, `6,12`.

For `-5` and `-4` with `M=3`, the C-style remainders are `-2` and `-1`, so `-5` comes first before parity is considered. Normalizing those remainders into a nonnegative range would change the required order.

## Why it works

Each value can be viewed as having a hierarchy of keys: signed remainder, odd-before-even class, and a parity-dependent numeric order. The comparator examines these keys in order and advances only when the earlier keys tie. Therefore, for every pair, it returns exactly the relation specified by the first priority that distinguishes them. These consistent keys are transitive, and equal values compare false in both directions, so the standard sort produces a sequence satisfying all rules.

## Complexity

Each comparison performs constant-time arithmetic and comparisons. Sorting takes `O(N log N)` time and stores `O(N)` values; the standard sorting algorithm uses logarithmic recursion or auxiliary stack space.

## Common mistakes

- Normalizing negative remainders as in Python rather than using C semantics.
- Testing oddness with `% 2 == 1` and missing negative odd values.
- Sorting odd ties ascending instead of descending.
- Using a nonstrict comparison for equal values.
- Exiting before printing the final `0 0` line.
