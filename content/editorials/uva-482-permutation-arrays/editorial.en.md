# Scatter each original token to its destination position

## Problem and constraints

Each case gives a permutation of positions 1 through `N` and then `N` floating-point-looking tokens. Original token `i` moves to new position `p[i]`. Print one token per line while preserving its exact spelling, including trailing zeros, signs, or exponent notation. Cases are separated by blank lines, and `N` is the number of indices on the first data line.

## Building the approach

Read the entire permutation line and allocate an answer array of the same length. Then read the value tokens in their original order. For each destination `p[i]`, assign the corresponding token to `answer[p[i]-1]`. Finally print the answer array from its first position onward.

The permutation describes destinations, not source positions to fetch. Since the task only moves representations and performs no arithmetic, values must remain strings. Converting through floating point could turn `1.00` into `1` or rewrite scientific notation.

## Walkthrough

For permutation `3 1 2` and tokens `1.00 -2.50 3e2`, the first token goes to position three, the second to one, and the third to two. Output is therefore `-2.50`, `3e2`, and `1.00`, with every spelling unchanged.

## Why it works

A permutation contains each destination exactly once. Assigning `answer[p[i]-1] = value[i]` therefore fills every output position once without overwriting another value, exactly matching the stated movement rule. Because input and output use the same unparsed strings, formatting is preserved as well as positions.

## Complexity

For `N` tokens with total text length `L`, time is `O(N+L)` and storage is `O(N+L)`.

## Common mistakes

- Interpreting `p[i]` as a source position rather than a destination.
- Reading tokens as `double` and changing their representation.
- Forgetting to convert one-based positions to zero-based array indices.
- Failing to consume the newline after the test count.
- Omitting the blank line between cases.
