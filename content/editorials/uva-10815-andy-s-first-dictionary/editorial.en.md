# Stream maximal alphabetic runs into a lowercase ordered set

## Problem and constraints

Read text until EOF. A word is a maximal consecutive run of ASCII letters `A-Z` or `a-z`; comparison is case-insensitive, and a single letter is a word. Digits, punctuation, and whitespace are delimiters. Print every distinct lowercase word in alphabetical order, one per line.

## Building the approach

Scan one character at a time. Convert uppercase ASCII letters to lowercase. If the character is a lowercase letter, append it to the current word. Otherwise, the maximal letter run has ended: insert the word into an ordered set if nonempty and clear the buffer.

A delimiter must terminate rather than merely disappear. For example, `red-blue` contains two words, not `redblue`.

After EOF, flush once more because the file may end immediately after a letter with no newline or punctuation. The ordered set simultaneously removes duplicates and maintains lexical output order.

## Walkthrough

For `Apple, APPLE! red-blue 123x`, recognized words are `apple`, `apple`, `red`, `blue`, and `x`. The set prints `apple`, `blue`, `red`, and `x` on separate lines.

Several consecutive delimiters create no empty word. The final `x` is retained even if EOF follows it directly.

## Why it works

During scanning, the buffer is exactly the lowercase letters since the most recent delimiter. Encountering a delimiter or EOF therefore ends one maximal alphabetic run, so every valid word is inserted once per occurrence and no word crosses a boundary.

Set keys are unique and ordered. Since all keys were normalized to lowercase, traversing the set yields every distinct case-insensitive word exactly once in alphabetical order.

## Complexity

For total input length `L`, `K` distinct words, and maximum word length `W`, scanning is `O(L)` and set insertion costs about `O(W log K)` per word. Space is the total length of distinct words plus the current buffer.

## Common mistakes

- Splitting only on whitespace and retaining punctuation.
- Deleting punctuation and joining words across it.
- Keeping uppercase and lowercase versions separately.
- Treating digits as part of a word.
- Forgetting the last word when EOF has no delimiter.
- Inserting empty strings for repeated delimiters.
