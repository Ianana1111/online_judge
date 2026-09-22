# Peel quotation layers from both ends of quote runs

## Problem and constraints

Input gives up to 100 positive runs of quotation marks separated by nonquote text. A 1-quotation has exactly one quote on each side of quote-free content. For `k>1`, k quotes surround a nonempty sequence of `(k-1)`-quotations, with ordinary text allowed between children. Find the largest k for the whole string.

## Building the approach

A sequence of 1-quotations contains any positive even number of quotes, but one single 1-quotation has exactly two. For `k>=2`, concatenated k-quotations can be reparsed as one, so test by peeling k quotes from both ends, then k-1, down through two. The remaining content must contain a positive even number of quotes.

Operate directly on run lengths. End pointers may skip only exhausted runs; one layer cannot cross ordinary text. If both ends lie in one run, require twice the layer count. Try k downward from the first/last run bound, also requiring at least `k(k+1)` total quotes.

## Walkthrough

A single run of 22 quotes supports k=4: peel 8, then 6, then 4, leaving four quotes as two 1-quotations. Level five needs at least 30. One quote forms none; exactly two forms level one.

## Why it works

Inductively, removing the required outer k quotes leaves a nonempty sequence of level k-1 quotations, whose concatenation closure lets it be treated as one and peeled again. At level one, a nonempty sequence is precisely positive even quote count, while a single level-one object is exactly two. Pointer checks enforce contiguous outer runs and prevent overlap. Descending complete candidates therefore returns the maximum valid level.

## Complexity

For maximum level K and N runs, testing all candidates costs `O(K(N+K))` time and `O(N)` extra space.

## Common mistakes

- Checking only total parity.
- Treating several level-one quotations as one level-one object.
- Accepting an empty inner sequence.
- Overlapping left and right consumption in one run.
- Crossing nonquote separators within one required quote block.
