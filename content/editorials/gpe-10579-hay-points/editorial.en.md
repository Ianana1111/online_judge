# Count every occurrence and preserve decimal values

## Problem and constraints

A dictionary assigns amounts from zero to one million to at most 1,000 lowercase words of length at most 16. Score at most 100 job descriptions by adding the value of every word occurrence; unknown words contribute zero. Each description ends with a line containing only a period. Amounts may be decimal values, and output has no prescribed fixed number of decimal places.

## Building the approach

The score is a sum over occurrences, not over distinct words. Build a word-to-value dictionary, then scan each description until the period. Repeated words add repeatedly, line breaks do not finish a description, and matching is by complete word rather than substring.

The subtle part is representing money exactly. Reading amounts as integers discards legal fractions; binary floating point can make 0.1 + 0.2 inexact. Construct a rational value directly from each decimal string and sum exact fractions.

A finite decimal has a reduced denominator containing only factors two and five. A sum of such values retains that property. To print the result, enlarge the denominator to a power of ten, format the exact digits, and remove unnecessary trailing fractional zeros. No rounding is needed.

## Walkthrough

If `skill` is worth 50 and `expertise` 100, one occurrence of each scores 150. Three occurrences of `skill` plus one `expertise` score 250, not 150. With `a = 0.1` and `b = 0.2`, the description `a b` scores exactly 0.3. Unlisted words add nothing.

## Why it works

After each token, the running total equals the sum of dictionary values for all words read in the current description. Adding the next word's value maintains that invariant; the period stops before adding a terminator. Resetting for each description keeps cases independent. Exact rational addition and an equivalent power-of-ten denominator preserve the value all the way through output.

## Complexity

For M dictionary entries and W description tokens, there are O(M + W) average dictionary operations, plus word hashing and rational arithmetic costs. The dictionary uses O(M) entries. This implementation also stores the entire tokenized input, so total storage depends on input length.

## Common mistakes

- Parsing decimal amounts as integers.
- Deduplicating repeated words.
- Ending descriptions at every newline.
- Matching a word inside a longer word.
- Forgetting to reset the salary between descriptions.
