# Pad and build the deterministic R-ary Huffman tree

## Problem and constraints

Encode the first N uppercase letters using radix digits 0 through R-1, with `2<=R<=10`, `2<=N<=26`, and positive frequencies. Follow the specified R-ary Huffman tie order, print deterministic codes, and print frequency-weighted average length to two decimals. Zero-frequency dummy leaves are not output.

## Building the approach

Each R-way merge reduces tree count by R-1, so pad the leaf count minimally until it is at least R and `(L-1)` is divisible by R-1. Dummy leaves have weight zero but sort after every real letter.

Use a priority queue keyed by weight then earliest contained letter. Pop R nodes; in pop order assign child digits 0 through R-1. Their parent has summed weight and minimum letter key. Repeat to one root, then traverse root-to-leaf to form codes. Compute `sum(freq*length)/sum(freq)` over real letters and round exactly.

## Walkthrough

Binary equal-frequency A,B,C,D merge into AB and CD then produce codes 00,01,10,11 with average 2.00. Ternary encoding of only A,B requires one dummy; it takes digit zero before real letters, which then follow frequency and letter priority.

## Why it works

A full R-ary tree has leaf count congruent to one modulo R-1, so minimal zero padding enables complete merges without affecting real weighted cost. The Huffman exchange argument places R lowest weights as deepest siblings; contracting them reduces to the same optimal subproblem and adds their total weight. Repetition proves optimality. Stored minimum-letter keys and pop-order digits implement the required unique tie rule, and root paths are the codes.

## Complexity

For padded leaf count L, building costs `O(L log L)` and traversal/output at most `O(L^2)` total code characters, with small `L<=34`.

## Common mistakes

- Omitting dummy padding.
- Breaking internal-node ties by creation time.
- Ordering dummy leaves before real letters.
- Appending bottom-up digits without reversing path direction.
- Averaging lengths without frequency weights.
