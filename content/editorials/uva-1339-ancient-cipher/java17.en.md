Permutation preserves every letter count. A bijective substitution only renames which letter owns each count; it cannot merge or split frequencies. Count all 26 letters in each string, sort both count arrays, and compare them.

Including zero counts is safe because both alphabets contain the same 26 letters. Sorting removes letter identity while retaining the full frequency multiset, including repeated values.

Keep zero counts in fixed-size arrays so the comparison reflects how many distinct letters are used.
