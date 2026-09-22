# Take the multiset intersection of the two strings

## Problem and constraints

Every two input lines form one case. Each line is a lowercase string of length at most 1000 and may be empty. Find the longest string `x` such that some permutation of `x` is a subsequence of the first string and some, possibly different, permutation is a subsequence of the second. Among maximum-length answers, print the lexicographically smallest one.

## Building the approach

The word “subsequence” may suggest longest common subsequence, but the two allowed permutations remove all relative-order constraints. Only the number of available copies of each letter matters, so the problem is the intersection of two multisets.

Count every letter in both strings. For a letter `c`, an answer can use at most `min(countA[c],countB[c])` copies because both inputs must supply them. Taking exactly that minimum for all 26 letters maximizes the total length. Printing those copies from `a` through `z` gives the smallest lexicographic ordering of that maximum multiset.

The inputs must be read with `getline`: an empty line is valid data and still consumes one half of a case.

## Walkthrough

For `abbc` and `bccc`, the shared counts are one `b` and one `c`, so the answer is `bc`.

For `ba` and `ab`, both letters can be retained. The answer is `ab`, even though an ordinary LCS has length only one, because each side may arrange the chosen letters differently. If either line is empty, every shared count is zero and the correct output is an empty line.

## Why it works

Any valid answer uses no more copies of a letter than either input contains, so its count for that letter is bounded by the smaller input count. Summing these per-letter minima gives an upper bound on the length of every answer.

Taking all of those copies reaches the bound: in each original string, select the required occurrences in their own appearance order, and then view that selected subsequence as the permitted permutation of `x`. Thus the constructed multiset has maximum length. Among all orderings of the same multiset, sorted ascending order has the smallest character at the first possible difference, so it is lexicographically smallest.

## Complexity

For input lengths `A` and `B`, counting takes `O(A+B)` time and producing the answer takes `O(26+output length)`. The two 26-entry count arrays use `O(1)` extra space, aside from the input lines.

## Common mistakes

- Solving longest common subsequence and imposing an order constraint the problem removed.
- Printing each shared letter only once and losing duplicates.
- Taking the larger count instead of the smaller one.
- Reading with `operator>>`, which skips empty lines and breaks case pairing.
- Printing in first-string order instead of sorted order.
