# Derive the LCS recurrence from the two final characters

## Problem and constraints

Every two input lines form a case. Find the length of their longest common subsequence, where characters may be deleted but the order of the remaining characters cannot change. Each line has length at most 1000. Spaces, punctuation, and empty lines are real input data, and matching is case-sensitive.

## Building the approach

Let `dp[i][j]` be the LCS length of the first `i` characters of `a` and the first `j` characters of `b`. Examine the final characters of these prefixes.

If they match, an optimal common subsequence can pair them at the end, giving `dp[i-1][j-1]+1`. If they differ, they cannot both be the same final matched character, so at least one is unused; the answer is `max(dp[i-1][j], dp[i][j-1])`.

Each row depends only on the previous row and the already computed cell to its left. Keep arrays named `previous` and `current` instead of the full table. Fill a complete row from left to right, then swap them.

Use `getline` so spaces and empty strings remain part of their correct cases.

## Walkthrough

For `abcdgh` and `aedfhr`, one longest common subsequence is `adh`, so the answer is three. The retained characters need not be contiguous, which distinguishes this problem from longest common substring.

For the strings `a b` and `a b`, the answer is three because the middle space is a character too. If either input line is empty, the corresponding zero row or column immediately gives an answer of zero without disrupting the next pair of lines.

## Why it works

When final characters differ, any common subsequence omits at least one of them, so it belongs to one of the two smaller prefix problems; taking their maximum is both necessary and attainable.

When final characters match, take an optimal solution and use their latest matching occurrence as the final pair without reducing its length. The portion before that pair is bounded by `dp[i-1][j-1]`, and appending the matching character attains one more. Thus the recurrence is correct by induction over prefix lengths. Rolling arrays preserve every value the next computation reads, so they produce the same final result as the full table.

## Complexity

For lengths `A` and `B`, time is `O(AB)` and DP space is `O(B)`, plus the input strings. At the maximum sizes, about one million state updates are performed.

## Common mistakes

- Reading with token extraction and losing spaces or empty lines.
- Solving longest common substring by resetting mismatches to zero.
- Ignoring character case.
- Reading `previous[j]` instead of `previous[j-1]` on a match and reusing a character.
- Swapping the two row arrays before the current row is complete.
- Trimming meaningful trailing spaces.
