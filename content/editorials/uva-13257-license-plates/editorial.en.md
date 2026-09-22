# Test every three-letter candidate with next-occurrence jumps

## Problem and constraints

For an uppercase string of length up to 100,000, count distinct length-three strings that occur as subsequences. Positions must strictly increase but need not be consecutive. Multiple position triples spelling the same string count once, and repeated letters such as AAA are allowed.

## Building the approach

There are only `26^3=17576` ordered candidate strings. Precompute `next[i][c]`, the earliest position at or after `i` containing letter c, or sentinel n when absent. Build it right-to-left by copying the next row and replacing the current character's entry.

For candidate a,b,c, jump to the earliest a from zero, then earliest b starting after that position, then c after b. Count the candidate exactly once if all three exist.

## Walkthrough

`AAAAAAA` offers many position triples but only candidate AAA, so the answer is one. A length-two string gives zero. `ABAC` includes ABA, ABC, AAC, and BAC; subsequence letters are ordered, not sorted.

## Why it works

If any valid position triple exists, choosing the earliest first occurrence cannot be later than its first position and therefore leaves at least the same suffix for the remaining letters. The same argument for the second letter proves greedy jumps succeed exactly when the candidate is a subsequence. Enumerating every ordered three-letter string once is complete and intrinsically deduplicated.

## Complexity

Building the table takes `O(26N)` time and space, and enumeration takes `O(26^3)` time. The answer is at most 17,576.

## Common mistakes

- Counting position triples instead of distinct strings.
- Counting only contiguous substrings.
- Starting the next search at the same chosen position.
- Treating letter triples as unordered.
- Indexing past the sentinel row after a failed jump.
