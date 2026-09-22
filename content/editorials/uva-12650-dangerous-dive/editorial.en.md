# Mark returned divers and scan the missing complement

## Problem and constraints

Divers are numbered 1 through `N`, and `R` returned badge IDs are given in arbitrary order. Print all nonreturning IDs in increasing order, with a space after each, or print `*` if everyone returned. Here `1<=R<=N<=10000`, and cases continue to end of file.

## Building the approach

Create a boolean array indexed by diver ID and mark every returned badge. Then scan all IDs from 1 through `N`; every false entry is missing and the scan order already produces sorted output.

Track whether any missing ID was printed. If none was found, output the required star instead of an empty line.

## Walkthrough

For `N=5` with returned IDs `3,1,5`, the marked set leaves 2 and 4, so output `2 4 `. For `N=3` with `3,1,2`, input order differs but all marks are present and the answer is `*`.

## Why it works

After input, an array entry is true exactly when that ID appears in the returned list. Scanning the complete valid range therefore selects exactly its complement, with no omissions or additions. Increasing scan order sorts the result, and finding no false entry is equivalent to everyone returning.

## Complexity

Reading and scanning take `O(R+N)` time and the marker array uses `O(N)` space.

## Common mistakes

- Inferring gaps from the unsorted input order.
- Stopping the scan before ID `N`.
- Allocating only `N` entries for one-based IDs.
- Printing a blank line rather than `*` when none are missing.
- Reusing marks across cases.
