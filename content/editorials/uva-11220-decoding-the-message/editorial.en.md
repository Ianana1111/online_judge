# Advance the letter position only after a successful extraction

## Problem and constraints

Each encoded line contains 1 to 30 alphabetic words. Take the first letter from the first usable word, then the second letter from a later word long enough, then the third, and so on. A word that is too short is skipped without advancing the desired position. Every line decodes independently. Messages contain multiple lines and are separated by blank lines.

## Building the approach

The next desired position depends on how many letters have been successfully extracted, not on how many words have been read. Let the current decoded string have length `k`. The next needed character is index `k` in zero-based notation.

Scan the words on one line. If `word.size() > k`, append `word[k]`; the decoded length then automatically advances to the next position. Otherwise ignore the word and keep the same `k`. Recreate the decoded string for every line.

Read input by complete lines first, then split each line into words. This preserves both the point where `k` must reset and the blank lines that separate test cases.

## Walkthrough

For `Hey good lawyer`, take `H` from index 0, `o` from index 1, and `w` from index 2, producing `How`.

For `as I previously previewed`, first take `a`. The word `I` is too short for index 1, so it is skipped without advancing. Then take `r` from `previously` and `e` from `previewed`, producing `are`.

## Why it works

Before each word, the decoded length equals the number of successful selections, so its value is exactly the next required zero-based index. If the word is long enough, appending that indexed character performs the next rule step and increments the state by one. If it is too short, leaving the state unchanged is exactly the required skip. Induction over the words proves that the complete decoded line is correct, and constructing a new state per line keeps lines independent.

## Complexity

If a message contains `L` input characters, reading and tokenizing it takes `O(L)` time. Each word is tested once, and the extra working space is one line plus the decoded result.

## Common mistakes

- Advancing the desired index for a word that was too short.
- Sharing one index across all lines of a message.
- Reading the entire input as a word stream and losing line boundaries.
- Indexing a word before checking its length.
- Changing the original letter case.
- Omitting the required case header or blank line between cases.
