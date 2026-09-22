# Require distinct positive frequencies for at least two letters

## Problem and constraints

A cool lowercase word contains at least two distinct letters, and every letter that appears has a frequency different from every other appearing letter. Each case contains up to 10,000 words of length at most 30, and cases continue to EOF. Print the number of cool words with a case label.

## Building the approach

Count occurrences in a 26-entry array. Scan only positive counts, incrementing the number of distinct letters and inserting each frequency into a set. A failed insertion means two appearing letters share a frequency. Accept only when at least two letters appeared and every insertion was unique.

Zero frequencies must be ignored: absent letters do not participate in the definition. The separate distinct-letter condition prevents a one-letter word from passing vacuously.

## Walkthrough

In `banana`, frequencies are 1 for b, 2 for n, and 3 for a, so it is cool. In `abbcc`, b and c both occur twice, so it is not. `aaaa` has only one distinct letter, while `ab` has two equal frequencies; both fail.

## Why it works

Character counting gives the exact frequency of each letter. Among positive entries, set insertion fails exactly when a previously processed appearing letter has the same count. Thus `unique` captures pairwise frequency distinction, and `distinct>=2` captures the remaining independent requirement. Their conjunction is precisely the definition.

## Complexity

For word length `L`, counting costs `O(L)` and examining the fixed alphabet is `O(26 log 26)`, with `O(1)` extra space.

## Common mistakes

- Accepting a word with only one distinct letter.
- Inserting zero counts for absent letters.
- Checking only whether some frequencies differ.
- Reusing counts between words.
- Treating the first `n` as a global test count.
