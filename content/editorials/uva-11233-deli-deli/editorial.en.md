# Apply plural rules in their stated priority order

## Problem and constraints

The input first gives up to 20 irregular singular-plural pairs and then up to 100 lowercase words to pluralize. Each word has at most 20 letters. The rules are ordered: use the irregular dictionary first; otherwise replace consonant-plus-`y` with `ies`; otherwise append `es` after `o`, `s`, `ch`, `sh`, or `x`; append `s` in every remaining case. Only these stated rules matter.

## Building the approach

Treat the irregular pairs as highest-priority overrides in a map. For each query, return the mapped value immediately if present. Otherwise evaluate the suffix rules with one `if / else if / else` chain so exactly the first applicable rule runs.

The consonant-plus-`y` rule requires at least two characters, a final `y`, and a preceding letter outside `aeiou`. A one-letter `y` has no preceding consonant. For two-letter suffixes such as `ch` and `sh`, a helper should check the word length before comparing its ending, avoiding unsafe indices.

## Walkthrough

If `octopus -> octopi` is in the irregular table, the answer is `octopi` even though the ordinary `s` suffix rule would suggest another form. `strawberry` ends in consonant-plus-`y`, so it becomes `strawberries`. `turkey` has a vowel before `y`, so it becomes `turkeys`. `peach` ends in `ch` and becomes `peaches`.

## Why it works

The map lookup implements exactly the first rule. When it fails, the next branch is true exactly for words of at least two letters ending in consonant-plus-`y`. The following branch recognizes precisely the five specified `es` endings. Because the branches are evaluated in the required order and only one runs, each word receives its first applicable transformation. If none applies, the final `s` branch is exactly the default rule.

## Complexity

Let `W` be a word length. With the ordered map used here, each lookup costs `O(W log L)` and suffix processing costs `O(W)` in the worst case. The dictionary uses `O(LW)` space; all limits are small.

## Common mistakes

- Applying a regular ending before checking the irregular dictionary.
- Replacing every final `y` without checking the preceding vowel.
- Reading the penultimate character of a one-letter word.
- Using separate independent `if` statements and transforming one word multiple times.
- Adding real-English exceptions that are absent from the problem rules.
