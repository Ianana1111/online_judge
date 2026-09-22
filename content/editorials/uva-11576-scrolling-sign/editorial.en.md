# Preserve the longest suffix-prefix overlap between words

## Problem and constraints

A sign displays `K` characters and scrolls left while new characters enter on the right. It must display `W` given uppercase words of length `K` in fixed order. Find the minimum number of characters that must be entered. Consecutive identical words require no additional input.

## Building the approach

The first word costs all `K` characters. Between previous and next words, if a suffix of length `L` from the previous word equals a prefix of length `L` from the next, preserve those cells and enter only `K-L` characters. Search `L` from `K` down to zero; the first match is the maximum overlap and minimum local addition.

After a word is fully displayed, the sign state is exactly that word, so earlier scrolling history cannot affect the next transition. Pairwise minimum additions therefore sum to the global minimum.

## Walkthrough

`CAT -> ATE` preserves `AT` and adds only E. `ATE -> TEA` preserves `TE` and adds only A, so the three-character first word plus two additions costs 5. `CAT -> CAT` has full overlap and adds zero.

## Why it works

If a transition adds `s` characters, the last `K-s` characters of the old display remain and must equal the new word's prefix, so every valid transition implies an overlap of length `K-s`. Conversely, any matching overlap can be kept while appending the remaining suffix. Maximizing `L` minimizes `s`. Since every transition ends in the same fixed next-word state, this local optimum cannot harm later choices.

## Complexity

Trying up to `K` overlap lengths and comparing up to `K` characters for each adjacent pair takes `O(WK^2)` time and `O(K)` extra space.

## Common mistakes

- Excluding full overlap for identical consecutive words.
- Comparing two prefixes instead of an old suffix with a new prefix.
- Stopping at the shortest rather than longest match.
- Adding characters to scroll the final word off the display.
- Reordering words to increase overlap.
