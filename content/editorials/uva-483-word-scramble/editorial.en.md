# Reverse only non-whitespace runs and copy every separator

## Problem and constraints

Reverse the characters inside every word while preserving word order, line structure, and all original whitespace. A word is a maximal run of printable non-whitespace characters, so punctuation belongs to its word. Spaces, tabs, line endings, and repeated separators must be copied exactly. Input continues to end of file and may end immediately after a word.

## Building the approach

Read the stream one character at a time and accumulate non-whitespace characters in a buffer. When a whitespace character arrives, reverse and print the buffered word, clear it, and then print that separator unchanged. After end of file, flush once more because the final word may have no following separator.

An empty buffer is safe to flush, so consecutive whitespace characters need no special branch. Formatted word input would lose how many separators appeared and whether they were spaces, tabs, or newlines, which is why the character stream matters.

## Walkthrough

`I love you.` becomes `I evol .uoy`; the period moves with the word because it is non-whitespace. `ab  cd` becomes `ba  dc` and retains both spaces. If the file ends directly after `xyz`, the final flush still prints `zyx`.

## Why it works

At every separator, the buffer contains exactly the maximal non-whitespace run since the preceding separator, so reversing it performs the required transformation on one complete word. Printing separators in their original encounter order preserves every boundary and line. The final flush handles the only run not followed by a separator, so every word is transformed exactly once and all other characters remain unchanged.

## Complexity

For `L` input characters and maximum word length `W`, time is `O(L)` and extra space is `O(W)`. The whole file is never stored.

## Common mistakes

- Reversing an entire line and changing word order.
- Treating punctuation as a separator.
- Recognizing only ordinary spaces and missing tabs or newlines.
- Reconstructing output from formatted tokens and collapsing whitespace.
- Forgetting the final word when EOF follows it directly.
