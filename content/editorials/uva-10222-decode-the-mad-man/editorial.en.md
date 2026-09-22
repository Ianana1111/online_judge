# Build the keyboard mapping instead of hard-coding every character

## Problem and constraints

Every character in a message was typed two keys to the right of the intended key on the same row of a standard QWERTY keyboard. Decode each message by moving every encoded key two positions left, while preserving spaces.

This site uses the stated CPE input variant: the first line contains a positive integer `N`, followed by exactly `N` message lines. The sample also shows that uppercase input letters are normalized before lookup: uppercase `I` decodes as lowercase `y`.

## Building the approach

A long chain of character-specific conditions would be tedious to write and easy to mischeck. The conversion rule depends only on keyboard position, so we should store the four keyboard rows and generate the mapping from their indices.

For every row and every position `i >= 2`, set `decode[row[i]] = row[i-2]`. Keeping rows separate prevents an invalid mapping from the beginning of one row into the end of another. Once the table exists, each message character takes one lookup.

Messages must be read with `getline` so spaces remain exactly where they appeared. After reading `N` with `operator>>`, discard the rest of that line before the first `getline`. For each character, convert letters to lowercase for lookup; if the table has no entry, preserve the original character. This naturally keeps spaces unchanged.

## Walkthrough

Consider `k[r dyt I[o`. On the home row, `k` is two positions to the right of `h`. On the top letter row, `[` maps to `o`, and `r` maps to `w`, producing `how`.

The next word `dyt` maps to `are`. Uppercase `I` is first normalized to `i`; moving two positions left yields `y`. The following `[` and `o` become `o` and `u`. Spaces are copied, so the complete result is `how are you`.

## Why it works

During table construction, every encoded key that has a valid key two places to its left is assigned exactly that required decoded key. Because each keyboard row is processed independently, every stored relation follows the problem's same-row rule.

The decoding loop visits message characters in their original order. A mapped key emits its correct decoded character, while an unmapped character such as a space is preserved. Concatenating these individually correct outputs, followed by one newline for the input line, produces exactly the decoded message.

## Complexity

The keyboard and lookup table have constant size. If all message lines contain `L` characters in total, decoding takes `O(L)` time. The table uses `O(1)` space, and the current line uses `O(M)` space where `M` is the longest line.

## Common mistakes

- Moving one key left, as in the related WERTYU problem, instead of two.
- Moving in the wrong direction.
- Joining all keyboard rows and accidentally allowing a mapping across row boundaries.
- Reading words with `cin >> word`, which loses the original spacing.
- Forgetting to consume the newline after `N`, causing the first `getline` to read an empty string.
- Omitting lowercase normalization and failing on the sample's uppercase `I`.
