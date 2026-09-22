# Find the maximum first, then print every tied site in input order

## Problem and constraints

Each case gives exactly ten URLs with relevance scores from 1 through 100. Print every URL having the maximum score, preserving original order, after the required case header. Any number of entries, including all ten, may tie.

## Building the approach

Store all ten records while maintaining `best`, the maximum score seen. After all input is known, scan the stored vector in original order and print every record with `score==best`.

This two-pass structure avoids printing a temporary maximum before a later higher score appears. Sorting or mapping by score could disturb ordering or discard duplicate records.

## Walkthrough

For scores `3,8,4,8,2,1,8,6,5,7`, print URLs at positions 2, 4, and 7. The first score 8 cannot be output alone because later ties remain. If all scores match, print all ten sites.

## Why it works

Repeated maximum updates make `best` equal to the greatest of all ten scores. The second pass prints exactly records equal to that value, including all ties and excluding all lower scores. Iterating the unchanged vector preserves their relative input order.

## Complexity

Each fixed case uses `O(1)` time and space; generalized to `K` entries, both scans take `O(K)` and storage `O(K)`.

## Common mistakes

- Keeping only the first or last maximum.
- Printing before all scores are known.
- Sorting tied URLs alphabetically.
- Failing to reset the maximum per case.
- Misformatting the `Case #k:` header.
