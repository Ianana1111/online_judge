# Rank strictly increasing words with combinations

## Problem and constraints

A valid word has one to five lowercase letters in strictly increasing order. Valid words are numbered from one, first by length and then lexicographically within a length. Invalid words such as `aab` or `cat` produce zero. The largest valid index is 83681.

## Building the approach

Once a set of letters is chosen, strict increasing order determines exactly one word. Thus valid words of length `L` correspond to choosing `L` letters from 26. First verify every adjacent pair increases. All valid shorter words come before the target and contribute

`C(26,1) + ... + C(26,L-1)`.

For words of the same length, count lexicographically earlier branches one position at a time. Suppose the previous chosen letter has index `previous`, the target's current index is `current`, and `r` positions remain. Every candidate strictly between `previous` and `current` creates earlier words. After choosing candidate `c`, the suffix is any selection of `r` letters from the `25-c` later letters, contributing `C(25-c,r)`.

Summing these disjoint branches and starting the rank at one accounts for the target itself.

## Walkthrough

The single-letter words `a` through `z` occupy ranks 1 through 26, so `ab` is rank 27. Before `az`, the same-length words `ab` through `ay` give 24 earlier branches, making its rank 51. `bc` follows at 52. `cat` contains a decrease and immediately yields zero.

## Why it works

Combination counts exactly enumerate each shorter length because a chosen letter set has one increasing arrangement. Any same-length word before the target has a unique first position where it differs: its letter there is smaller, and its previous prefix matches. The position-and-candidate loops classify it by that unique difference, while the binomial coefficient counts every valid later suffix. These classes are disjoint and complete, so adding one gives the target's correct one-based rank.

## Complexity

The Pascal table is a fixed 27-by-6 array. Each word takes `O(26L)` time for `L <= 5` and `O(1)` extra working space.

## Common mistakes

- Accepting equal adjacent letters.
- Using ordinary dictionary order across different lengths.
- Forgetting all shorter valid words.
- Allowing the suffix to reuse its selected candidate.
- Returning a zero-based rank.
