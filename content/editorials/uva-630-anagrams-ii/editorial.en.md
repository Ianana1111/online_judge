# Compare sorted-letter signatures while preserving original words

## Problem and constraints

Each dataset has fewer than 1000 lowercase dictionary words of length at most 20, followed by queries ending with `END`. For every query, list every dictionary occurrence that can be rearranged into it, including an identical word. Number matches consecutively from one in a width-three field. This platform accepts any listing order containing the complete multiset; query and dataset order remain fixed.

## Building the approach

Sort a copy of each word's letters to create a signature. Two words are anagrams exactly when these signatures match, because sorting preserves every letter multiplicity. A set of distinct letters would be insufficient for words containing repeated letters.

Precompute dictionary signatures while keeping original dictionary strings separately. For a query, compute its signature, scan all dictionary entries, and collect every matching occurrence. Duplicate dictionary entries remain duplicate output records. If no match exists, print the required no-anagrams line rather than a numbered item.

## Walkthrough

Dictionary words `atol`, `lato`, and `tola` all have signature `alot`, so query `tola` lists all three, including itself. Query `aatr` matches `rata` and `tara`, each containing two `a`s. Word `art` has the same distinct letter set but one fewer `a`, so it is not an anagram of `aatr`.

## Why it works

Sorting groups all copies of each letter into one canonical sequence. Equal signatures therefore mean equal frequency for every letter, which is both necessary and sufficient for one word to be rearranged into the other. Scanning every dictionary occurrence and selecting exactly equal signatures yields a complete result with no false match. Rebuilding and renumbering the list per query preserves query grouping.

## Complexity

For `N` dictionary words, `Q` queries, and maximum length `L <= 20`, preprocessing costs `O(NL log L)`. Each query costs `O(L log L + NL)` with the direct scan, and storage is `O(NL)`.

## Common mistakes

- Comparing only distinct-letter sets and losing multiplicities.
- Excluding a dictionary word identical to the query.
- Printing sorted signatures instead of original words.
- Continuing numbering across queries.
- Treating `END` as a query or adding extra blank lines between queries.
