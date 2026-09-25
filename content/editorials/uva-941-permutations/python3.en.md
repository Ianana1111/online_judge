Choose the answer one position at a time. Under a fixed prefix, all permutations beginning with the smallest available next letter form the first contiguous lexicographic block, followed by the next letter's block.

Tentatively remove candidate `c`. If `R` characters remain with frequencies `fi`, its block size is

`R! / product(fi!)`.

If current zero-based rank is below that size, keep `c` and continue within the block. Otherwise subtract the entire block, restore `c`, and try the next letter. Repeated occurrences share one frequency and therefore do not create duplicate positional permutations.

Choose letters left to right in lexical order. Temporarily take one letter and count distinct permutations of the remaining multiset. Keep it if the rank lies in that block; otherwise subtract the whole block and try the next letter.
