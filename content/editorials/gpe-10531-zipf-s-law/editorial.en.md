# Let the definition of a word drive the parser

## Problem and constraints

For each case, read a positive target frequency and a text of at most 10,000 words, ending at a line exactly equal to `EndOfText`. A word is a maximal run of English letters; every nonletter separates words. Ignore case. Print all words appearing exactly the target number of times, in lowercase alphabetical order, or `There is no such word.` if none do. Separate case outputs with a blank line.

## Building the approach

Splitting only on spaces is not enough. `beta123BETA` contains two words, and `Can't` contains `can` and `t`. Instead, scan characters while accumulating the current run of letters.

Convert each letter to lowercase immediately. On a nonletter, count the accumulated word if nonempty and clear it. Do the same at every line end, since a newline also separates words. Check for the sentinel line before scanning it so the marker never enters the frequency table.

An ordered map both counts words and provides the required alphabetical output order. After reading the entire text, keep only entries whose count equals the target. Because the text contains at most 10,000 words, any larger target has no answer; the parser can safely cap a huge target at 10,001 rather than overflow a fixed-width integer.

## Walkthrough

For `Alpha, ALPHA!`, both runs become `alpha`, with frequency two. For `beta123BETA`, the digits finish the first word and the second run increments the same lowercase key. An empty text block has no matching word for any positive target.

## Why it works

The current buffer always contains exactly the letters since the most recent separator. Finishing it at each separator and line end counts every maximal letter run once. Lowercasing merges precisely the case variants. Thus map counts match the definition, equality filtering selects the requested frequency, and map iteration supplies alphabetical order.

## Complexity

For L characters, U distinct words, and maximum word length W, scanning takes O(L). Each ordered-map lookup may compare O(W log U) characters. Stored distinct words occupy at most O(L) space.

## Common mistakes

- Splitting only on whitespace or retaining internal punctuation.
- Treating uppercase and lowercase forms separately.
- Counting the sentinel as text.
- Joining words across line boundaries.
- Filtering by at least the target instead of exactly the target.
