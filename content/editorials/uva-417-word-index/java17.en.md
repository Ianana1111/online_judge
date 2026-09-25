Once a set of letters is chosen, strict increasing order determines exactly one word. Thus valid words of length `L` correspond to choosing `L` letters from 26. First verify every adjacent pair increases. All valid shorter words come before the target and contribute

`C(26,1) + ... + C(26,L-1)`.

For words of the same length, count lexicographically earlier branches one position at a time. Suppose the previous chosen letter has index `previous`, the target's current index is `current`, and `r` positions remain. Every candidate strictly between `previous` and `current` creates earlier words. After choosing candidate `c`, the suffix is any selection of `r` letters from the `25-c` later letters, contributing `C(25-c,r)`.

Summing these disjoint branches and starting the rank at one accounts for the target itself.

Count every shorter valid word first. For equal length, choose the first position with a smaller letter and count possible suffixes with combinations. Strict increase fixes one ordering per subset.
