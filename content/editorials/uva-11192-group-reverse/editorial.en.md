# Derive the group length, then reverse each segment in place

## Problem and constraints

Given a group count `G` and an alphanumeric string, split the string in its original order into exactly `G` equal contiguous groups and reverse every group separately. The string length is at most 100 and is guaranteed to be divisible by `G`. A line containing only zero ends the input and has no following string.

## Building the approach

The important interpretation is that `G` is the number of groups, not their length. If the string length is `L`, each group has length `size = L/G`. The groups are the half-open ranges `[0,size)`, `[size,2*size)`, and so on.

Apply an in-place reverse to each range while leaving the range order unchanged. When `G=1`, the only group is the whole string. When every group has length one, the output stays unchanged. These boundaries are useful checks that `G` and `size` have not been confused.

## Walkthrough

For `ABCDEF` with `G=3`, the groups are `AB`, `CD`, and `EF`, so the result is `BA` + `DC` + `FE` = `BADCFE`. With `G=2`, the groups are `ABC` and `DEF`, producing `CBAFED`. Reversing the whole string would instead give `FEDCBA`, which changes the order of the groups and is wrong.

## Why it works

Because `L` is divisible by `G`, the generated ranges are contiguous, disjoint, and together cover every character exactly once. Reversing a range moves each character to its symmetric position inside that group without touching another range. Processing all ranges therefore reverses every group and preserves their original ordering, exactly matching the required transformation.

## Complexity

Every character participates in one segment reversal, for `O(L)` time. The reversals are in place and use `O(1)` extra space beyond the input string.

## Common mistakes

- Treating `G` as the number of characters per group.
- Reversing the order of the groups as well as their contents.
- Passing an inclusive right endpoint to a half-open reversal function.
- Trying to read a string after the terminating zero.
- Mishandling valid one-character groups.
