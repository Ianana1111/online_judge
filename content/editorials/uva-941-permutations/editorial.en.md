# Skip lexicographic blocks using multiset permutation counts

## Problem and constraints

Given a lowercase string of length 1 through 20 and zero-based rank `N`, output the `(N+1)`-th distinct lexicographic permutation. This platform explicitly supports repeated characters, so total permutations are `length!` divided by every frequency factorial, and `N` is guaranteed below that actual count. `20!` fits signed 64-bit range.

## Building the approach

Choose the answer one position at a time. Under a fixed prefix, all permutations beginning with the smallest available next letter form the first contiguous lexicographic block, followed by the next letter's block.

Tentatively remove candidate `c`. If `R` characters remain with frequencies `fi`, its block size is

`R! / product(fi!)`.

If current zero-based rank is below that size, keep `c` and continue within the block. Otherwise subtract the entire block, restore `c`, and try the next letter. Repeated occurrences share one frequency and therefore do not create duplicate positional permutations.

## Walkthrough

Distinct permutations of `aabb` are `aabb, abab, abba, baab, baba, bbaa`. For rank 2, the `a` prefix block has `3!/2!=3` strings, so keep `a`. At the next position, candidate `a` has one completion and is skipped, leaving relative rank one in the `ab` block; continued selection yields `abba`.

## Why it works

For any prefix, grouping by next character partitions all remaining distinct permutations into disjoint, lexicographically ordered contiguous blocks. The multinomial formula counts each block exactly despite duplicate characters. Subtracting a skipped block converts the global relative rank into the next block's relative rank; selecting a containing block preserves it. Induction over positions maintains the correct prefix and rank until one unique target string remains.

## Complexity

With fixed 26-letter alphabet and length `L`, trying candidates and recomputing counts takes `O(L*26^2)` time and `O(L+26)` space. Factorials through 20 are precomputed exactly.

## Common mistakes

- Treating equal character occurrences as distinct positions.
- Applying ordinary factoradic division by `(R-1)!` with duplicates.
- Interpreting the supplied rank as one-based.
- Failing to restore a candidate after skipping its block.
- Using `double` or 32-bit integers for factorials and ranks.
