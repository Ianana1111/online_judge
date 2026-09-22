# Preserve each excuse while scoring complete alphabetic words

## Problem and constraints

Each set contains up to 20 lowercase keywords and 20 excuse lines. Find every original line with the maximum total number of keyword occurrences. Matching ignores letter case, but only complete alphabetic words count; every nonletter is a separator and repeated occurrences score repeatedly. Tied lines may be printed in any order, but their exact original characters, spaces, and multiplicities must be preserved.

## Building the approach

Keep the original excuse untouched for output. Separately scan it into maximal runs of ASCII letters. Append lowercase letters to a token buffer. Whenever a digit, space, or punctuation character appears, finish the token: if it is in the keyword set, add one point, then clear it. Finish once more at end of line so a final word without punctuation is not lost.

This tokenization prevents a keyword such as `dog` from matching inside `dogmatic`, while a digit in `DOG2dog` correctly splits two words. A hash set gives one membership test per completed word.

After scoring every line, find the maximum and print all lines with that score. Starting the maximum at zero ensures that when no keyword occurs, every zero-score excuse is printed.

## Walkthrough

With keyword `dog`, `DOG2dog` scores twice because the digit separates two complete words. `dogmatic` scores zero. The line `Dog dog!` scores twice, yet output retains its uppercase `D`, spacing, and punctuation. Two identical input lines remain two separate output records if both tie.

## Why it works

The scan partitions each line uniquely into maximal alphabetic runs, exactly the problem's definition of words. Every run is normalized and tested once at its ending separator or at end of line, so every valid occurrence contributes once and no substring contributes falsely. Taking all scores equal to the global maximum selects exactly every worst excuse, while storing the originals guarantees faithful output.

## Complexity

For `L` total excuse characters, expected time is `O(L)` with hash-set lookup. Space is `O(K + E*70)` for keywords and original lines.

## Common mistakes

- Searching substrings and counting `dog` inside `dogmatic`.
- Counting each keyword at most once per line.
- Failing to treat digits as word separators.
- Forgetting to finish the token at end of line.
- Printing the normalized lowercase line or only the first tied excuse.
