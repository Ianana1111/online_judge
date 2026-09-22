# Compare the multiset of letter frequencies after forgetting names

## Problem and constraints

Two equal-length uppercase strings may undergo a consistent one-to-one letter substitution and then arbitrary position permutation. Decide whether one can become the other. Length is at most 100, and pairs continue to EOF.

## Building the approach

Permutation preserves every letter count. A bijective substitution only renames which letter owns each count; it cannot merge or split frequencies. Count all 26 letters in each string, sort both count arrays, and compare them.

Including zero counts is safe because both alphabets contain the same 26 letters. Sorting removes letter identity while retaining the full frequency multiset, including repeated values.

## Walkthrough

`AAB` and `CCD` both have positive frequencies 2 and 1, so A may map to C and B to D. `AAAB` has 3 and 1 while `AABB` has 2 and 2, so equal length and equal distinct-letter count are insufficient.

## Why it works

Any legal substitution and permutation preserves the multiset of frequencies, proving necessity. If sorted frequency arrays match, pair source and target letters with equal counts to form a bijection; unused letters can be paired arbitrarily. After renaming, both strings have identical counts, and a permutation can arrange the target, proving sufficiency.

## Complexity

For length `L`, counting costs `O(L)`, sorting fixed 26-entry arrays costs `O(26 log 26)`, and extra space is constant.

## Common mistakes

- Comparing only the number of distinct letters.
- Requiring an anagram with unchanged letter identities.
- Using a set and losing repeated frequencies.
- Allowing multiple source letters to merge into one target.
- Comparing only the largest frequency.
