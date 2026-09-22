# Recover an unknown alphabet from a permutation rank

## Problem and constraints

An unknown language has `n` distinct lowercase symbols whose alphabet order is not necessarily English order. A string containing every symbol once is known to be the `k`-th lexicographic permutation under that unknown order. Recover the alphabet order. Here `n<=20`, `1<=k<=n!`, and there may be 5,000 cases. The task is the inverse of generating the `k`-th permutation: the input string is fixed while the comparison alphabet is unknown.

## Building the approach

Convert the one-based rank to zero-based. Permutations of `n` symbols are partitioned by their first symbol into `n` blocks of `(n-1)!` permutations. Therefore `rank/(n-1)!` tells us the relative alphabet position of the known first symbol, not which symbol to choose for a generated permutation.

Maintain `available`, the still-empty positions of the unknown alphabet in increasing order. Put `word[i]` into position `available[index]`, erase that position, and replace rank by its remainder within the selected block. Repeat with the next smaller factorial.

Twenty factorial fits unsigned 64-bit storage. Vector erasure is quadratic in `n`, but `n` is only twenty.

## Walkthrough

For `word=bdac` and `k=11`, zero-based rank is 10. Dividing by `3!` gives one, so `b` is the second-smallest alphabet symbol. The remainder is four; dividing by `2!` gives two, so `d` occupies the third remaining alphabet position. Continuing places `a` and `c`, recovering `abcd`.

For input `abcd, k=5`, the result is `acdb`. This is not the same operation as printing the fifth permutation of an already known English alphabet.

## Why it works

After a fixed prefix, each possible next symbol under the unknown alphabet heads an equally sized factorial block. The quotient uniquely identifies the current input symbol's rank among unplaced alphabet positions, while the remainder is exactly its suffix rank inside that block.

`available` preserves the order of unfilled positions, so choosing its indexed entry realizes that relative rank. Repeating fixes every symbol exactly once. The reconstructed alphabet makes the input string occupy precisely the given rank, and the unique quotient at every step proves uniqueness.

## Complexity

Factorials take constant precomputation. Each case uses `O(n^2)` time for vector erasures and `O(n)` space.

## Common mistakes

- Forgetting to subtract one from the rank.
- Sorting the input symbols by English order first.
- Producing the `k`-th permutation instead of the alphabet.
- Failing to remove an occupied alphabet position.
- Storing `20!` in 32-bit or floating-point form.
