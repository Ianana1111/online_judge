# Count transitions from separators into alphabetic runs

## Problem and constraints

Count words independently on every input line through end of file. A word is a maximal run of English letters `A-Z` or `a-z`. Digits, punctuation, spaces, and every other nonletter separate words. Apostrophes are therefore separators under this problem's definition.

## Building the approach

Keep a boolean `inside` telling whether the preceding character belongs to a letter run. For the current character, compute whether it is an ASCII letter. If it is a letter while `inside` is false, a new word begins, so increment the count. Then assign `inside = letter`; any separator automatically leaves the current word.

Counting starts rather than ends means a word at the final character is already counted and needs no special flush. Reset both state and count for each input line so letters on adjacent lines never join.

## Walkthrough

`Hello,world42ABC` contains the runs `Hello`, `world`, and `ABC`, giving three. Under the stated definition, `don't` contains `don` and `t`. In `a---B`, several consecutive separators do not create empty words, and the result is two.

## Why it works

Every maximal letter run has exactly one first character, preceded either by the line boundary or a nonletter. That is precisely the condition `letter && !inside`, so every word contributes once. Later letters in the same run see `inside == true`, and separators are never counted. Therefore the result equals the number of words and includes no false entries.

## Complexity

For a line of length `L`, scanning takes `O(L)` time. Apart from the stored input line, the algorithm uses `O(1)` state.

## Common mistakes

- Splitting only on spaces and missing punctuation or digits.
- Treating digits as part of words.
- Recognizing only one letter case.
- Incrementing for every letter rather than every run start.
- Waiting for a separator and losing a word at line end.
