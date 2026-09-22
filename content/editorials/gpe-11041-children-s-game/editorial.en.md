# Compare what two neighboring numbers actually contribute

## Problem and constraints

Reorder up to 50 positive integers and concatenate all of them exactly once to form the largest decimal integer. Duplicate input values must all be used. A zero count terminates input. The result can be too long for a built-in integer, so keep the values as strings.

## Building the approach

Sorting by numeric value fails: 3 should precede 30 because 330 is larger than 303. Ordinary lexicographic order can also fail when one string is a prefix of another.

Instead, compare the two possible local results. Put a before b exactly when `a+b > b+a`. These concatenations have the same length, so lexicographic comparison gives their numerical order. Sort using this rule and print every string consecutively.

An equal comparison is not an error: for 12 and 1212, either order yields the same digits. The comparator must use strict greater-than, not greater-than-or-equal, to satisfy the sorting contract.

## Walkthrough

For `123, 124, 56, 90`, the order is `90, 56, 124, 123`, producing `9056124123`. For `12` and `121`, compare `12121` with `12112`; 12 belongs first. Repeated inputs remain repeated blocks in the answer.

## Why it works

If adjacent blocks a,b have `a+b < b+a`, swapping them increases that fixed-length middle portion without changing the surrounding digits, so it increases the whole result. The comparison is transitive: algebraically it compares `value(a)/(10^|a|−1)` with `value(b)/(10^|b|−1)`. Sorting by it therefore removes all improving adjacent swaps and yields a maximum concatenation. Equal blocks under this relation can be exchanged without changing the result.

## Complexity

For N strings of maximum length L, sorting takes O(NL log N) time, including concatenation comparisons, and storage is O(NL). No conversion of the final answer to an integer is required.

## Common mistakes

- Sorting the integers by numerical size.
- Using ordinary string order for prefix-related values.
- Writing a non-strict comparator.
- Removing duplicate values with a set.
- Converting the complete concatenation to `long long`.
