# Index wildcard patterns, then BFS the shortest word chain

## Problem and constraints

A dictionary contains at most 25,143 lowercase words of length at most 16. Two words are adjacent when they have equal length and differ in exactly one position. For every query, print any shortest dictionary-only chain from start to finish, or `No solution.` when none exists; separate query outputs with a blank line. A present word queried to itself is a valid one-word path.

## Building the approach

Words are vertices of an unweighted graph, so shortest chains require BFS. Building all pairwise edges would compare hundreds of millions of word pairs. Instead, for every word and every character position, build a pattern that removes that position. Words sharing the same removed-position pattern and length form a bucket; distinct members differ only in that position.

The implementation encodes words exactly in base 27, subtracts one positional digit to create the wildcard, and appends length. Sixteen letters fit in unsigned 128-bit storage, so equal keys are exact rather than hash-collision guesses. Sorting all pattern records groups equal buckets contiguously.

During a query BFS, expand each bucket at most once. The first time BFS reaches a bucket is from the smallest possible distance; later expansion cannot improve any member. Store the first predecessor for path reconstruction.

## Walkthrough

With `cat,cot,cog,dog,dot`, both `cat-cot-cog-dog` and `cat-cot-dot-dog` are shortest valid answers. The pattern `c*t` links cat and cot; `*ot` links cot and dot.

Words of different length never share a legal edge. A missing endpoint immediately has no solution.

## Why it works

Equal-length words have unique base-27 encodings. Removing the same position yields equal keys exactly when all other positions match; distinct words then differ in precisely that one position. Thus buckets represent all and only legal graph adjacencies.

BFS removes vertices in nondecreasing distance. A bucket first encountered from distance d can discover every member at distance at most d+1; any later encounter begins at d or greater and cannot yield a shorter route. Expanding once therefore preserves shortest distances. First predecessors form a shortest-path tree, and reversing the finish-to-start chain outputs a legal shortest solution.

## Complexity

For N words, maximum length L, and `P<=NL` pattern records, preprocessing costs `O(P log P)`. A query is `O(N+P)` worst case, with `O(N+P)` storage.

## Common mistakes

- Using DFS and returning a nonshortest chain.
- Allowing insertion or deletion between different lengths.
- Using words outside the dictionary.
- Repeatedly scanning the same buckets.
- Encoding patterns in an integer too narrow to remain exact.
