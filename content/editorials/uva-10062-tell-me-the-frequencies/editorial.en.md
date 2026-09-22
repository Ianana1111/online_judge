# Sort each line's ASCII codes by frequency, then reverse code

## Problem and constraints

Every input line is an independent case. Count frequencies of its ASCII characters with codes 32 through 127; newline and carriage return are excluded. Print only characters that occur, sorting by increasing frequency and, for ties, decreasing ASCII code. Cases are separated by a blank line. Uppercase, lowercase, and space are distinct, and even an empty line is still a case.

## Building the approach

Use `getline` so spaces and empty lines are preserved. Remove a trailing carriage return from Windows line endings, but leave genuine leading and trailing spaces untouched. Create a fresh 128-entry count array and increment by character code.

Collect only positive-frequency codes from 32 through 127. Sort with an explicit two-key comparator: smaller count first; when counts match, larger code first. Print numeric codes rather than the character glyph.

Track whether a line has already been processed to emit one blank line between cases. This must be based on cases, not on whether the previous line contained characters.

## Walkthrough

For `AAABBC`, C has frequency one, B two, and A three, so output is `67 1`, `66 2`, `65 3`. For `ABC`, all counts are one and reverse code order again produces 67, 66, 65.

If a line contains spaces, code 32 participates normally. An empty line prints no frequency rows but still affects separation before the next case.

## Why it works

Each input character increments exactly the array cell corresponding to its ASCII code, so the counts are exact and independent for each line. Filtering positive cells retains all and only occurring characters.

The comparator implements the required primary and secondary ordering directly. Iterating the sorted codes therefore prints precisely the expected rows, while line-based case tracking produces correct blank separators even around empty input.

## Complexity

For line length `L` and at most 96 distinct legal codes, counting takes `O(L)` and sorting `O(K log K)`. Auxiliary count storage is constant.

## Common mistakes

- Reading whitespace-delimited tokens and losing spaces or empty lines.
- Sorting tied codes ascending.
- Combining uppercase and lowercase.
- Counting CR or LF as data.
- Reusing descending-frequency rules from another problem.
