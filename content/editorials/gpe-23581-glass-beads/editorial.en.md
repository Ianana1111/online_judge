# Eliminate rotation starts in linear time

## Problem and constraints

A necklace is a lowercase string of length at most 10,000 whose end connects to its beginning. Cutting at any position produces a rotation. Return the one-based start of the lexicographically smallest rotation; when several starts produce the same minimum string, choose the smallest position. Looking only for the smallest character is insufficient because later characters break ties.

## Building the approach

Constructing and comparing all rotations costs quadratic time and storage. Maintain two candidate starts `i` and `j`, and let `k` be the length of their equal compared prefix. Compare characters at `(i+k)%n` and `(j+k)%n`.

When they match, increase `k`. At the first mismatch, the side with the larger character is worse. More strongly, every candidate from that start through start plus `k` can be eliminated, so advance the losing pointer by `k+1` and reset `k` to zero. If both pointers meet, advance the one just moved again to keep candidates distinct.

If a pointer leaves the original start range, the other survives. If `k` reaches `n`, both rotations are identical and the smaller index satisfies the tie rule.

## Walkthrough

For `baaa`, the smallest rotation is `aaab` at position two. Although positions two through four all begin with `a`, later comparisons identify the true best start.

For `abab`, positions one and three both yield `abab`, so the answer is one. An all-`a` necklace likewise returns one rather than whichever candidate happened to move last.

## Why it works

Suppose the candidates share `k` characters and the `i` side is larger at the first mismatch. For every offset `t<=k`, starts `i+t` and `j+t` share the corresponding shortened prefix and then encounter the same larger-versus-smaller comparison. Therefore none of starts `i` through `i+k` can be globally minimal. The symmetric argument handles a larger `j` side.

Every jump removes only proven losers, so at least one minimum candidate remains. Pointers advance monotonically, and a full-length equality represents identical rotations; selecting the smaller remaining index then enforces the required tie-breaking.

## Complexity

Matched work is amortized against pointer jumps. Each pointer advances `O(n)` positions and the final equality comparison is at most `n`, giving `O(n)` time and `O(1)` extra space.

## Common mistakes

- Returning the first occurrence of the smallest character.
- Constructing every rotation for `O(n^2)` work.
- Choosing the larger index for equal periodic rotations.
- Forgetting to convert the zero-based result to one-based output.
- Allowing both candidate pointers to remain equal.
