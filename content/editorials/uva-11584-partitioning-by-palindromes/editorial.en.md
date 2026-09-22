# Precompute palindrome intervals, then choose the final segment

## Problem and constraints

Partition a lowercase string of length up to 1,000 into the minimum number of nonempty contiguous palindromes. Characters cannot be reordered or skipped. The answer is the number of groups, not cuts; single characters ensure a solution always exists.

## Building the approach

First compute `palindrome[left][right]`. An interval is palindromic when its endpoints match and its interior is palindromic; intervals of length one or two need no interior lookup. Iterate `left` from right to left so every required interior state is ready.

Let `groups[end]` be the minimum groups covering the first `end` characters, with `groups[0]=0`. Choose the start `begin` of the final segment. Whenever `s[begin..end-1]` is palindromic, update from `groups[begin]+1`. Trying every final segment yields the optimum.

## Walkthrough

`aaadbccb` can be partitioned as `aaa | d | bccb`, giving 3. Greedily choosing a longest palindrome is unsafe: `abaa` has optimal `aba | a` with 2 groups. `racecar` needs one group, while a string with no longer palindrome uses one group per character. `aab` yields `aa | b`, so the answer is 2 groups rather than one cut.

## Why it works

The interval recurrence is correct by induction on length: matching endpoints surround a palindrome exactly when the whole interval is a palindrome. Every optimal partition of a prefix has one final palindromic segment beginning at some `begin`. If its preceding partition were not optimal, replacing it would improve the whole solution. The transition enumerates that exact choice and only legal palindromic choices, so the minimum is correct for every prefix.

## Complexity

Both palindrome preprocessing and prefix transitions take `O(N^2)` time. The table uses `O(N^2)` space and the prefix array `O(N)`.

## Common mistakes

- Greedily fixing the longest palindrome prefix or suffix.
- Solving longest palindromic subsequence instead of contiguous partitioning.
- Filling the palindrome table before its interior states exist.
- Initializing the empty prefix to one.
- Printing cuts instead of palindrome groups.
