# Count strings without `UUU`, then take the complement

## Problem and constraints

Each of `n` positions, with `1 <= n <= 30`, contains `L` or `U`. Count distinct strings containing at least one run of three consecutive `U` characters. A string with overlapping or multiple `UUU` occurrences still counts once. Input ends with zero.

## Building the approach

Directly choosing a `UUU` starting position double-counts strings such as `UUUU`. Instead count safe strings containing no `UUU` and subtract from all `2^n` strings.

Let `safe[n]` be the safe count. Set `safe[0]=1`, `safe[1]=2`, and `safe[2]=4`. For `n >= 3`, a safe string ends in exactly one of `L`, `LU`, or `LUU`, according to whether it has zero, one, or two trailing `U`s. Removing that suffix leaves an arbitrary safe string of lengths `n-1`, `n-2`, or `n-3`, so

`safe[n] = safe[n-1] + safe[n-2] + safe[n-3]`.

The required result is `2^n - safe[n]`.

## Walkthrough

At `n=3`, eight total strings and seven safe strings leave only `UUU` as dangerous. At `n=4`, there are 13 safe strings and three dangerous strings: `UUUL`, `LUUU`, and `UUUU`. The overlapping occurrences inside `UUUU` do not duplicate it under the complement method. Lengths one and two return zero.

## Why it works

Every safe string of length at least three has zero, one, or two trailing `U`s; three would violate safety. Its unique suffix is respectively `L`, `LU`, or `LUU`, and removing it yields a safe shorter string. Conversely, appending each suffix to a safe prefix creates a safe string in its corresponding disjoint class. This bijection proves the recurrence. All binary strings split uniquely into safe and dangerous sets, so subtracting safe from `2^n` counts each dangerous string once.

## Complexity

Precomputing all 30 states takes `O(30)` time and space, and each query is `O(1)`.

## Common mistakes

- Counting occurrences of `UUU` rather than distinct strings containing it.
- Omitting `safe[0]=1`.
- Using a two-term Fibonacci recurrence and losing the `LUU` class.
- Printing the safe count instead of its complement.
- Using floating-point `pow` for an exact power of two.
